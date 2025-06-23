import redisClient from "@/lib/redis";
import type { MiddlewareHandler } from "hono";
import { APIError } from "@/core/helpers/api-error";

type RateLimiterOptions = {
    windowSecs: number;
    limit: number;
};

export function rateLimiter(options: RateLimiterOptions): MiddlewareHandler {
    return async (c, next) => {
        try {
            const ip = c.req.header("x-forwarded-for") || "127.0.0.1";
            const key = `ratelimit:${ip}`;

            const replies = await redisClient
                .multi()
                .incr(key)
                .expire(key, options.windowSecs)
                .exec();

            if (!replies) {
                console.error("Redis transaction failed.");
                return await next();
            }

            const currentRequests = replies[0][1] as number;

            c.res.headers.set("X-RateLimit-Limit", options.limit.toString());
            c.res.headers.set("X-RateLimit-Remaining", Math.max(0, options.limit - currentRequests).toString());

            if (currentRequests > options.limit) {
                c.res.headers.set("Retry-After", options.windowSecs.toString());
                throw new APIError(429, `Too Many Requests. Please try again after ${options.windowSecs} seconds.`, "RATE_LIMIT_EXCEEDED");
            }

            await next();

        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            console.error("Rate Limiter Error:", error);
            await next();
        }
    };
}