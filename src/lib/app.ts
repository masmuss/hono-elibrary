import { parseEnv } from "@/config/env";
import defaultHook from "@/core/helpers/hooks/default-hook";
import type { AppBindings } from "@/lib/types";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: true,
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();
	app.use((c, next) => {
		c.env = parseEnv(process.env);
		return next();
	});

	if (process.env.NODE_ENV !== "test") {
		console.log("✅ Rate limiter is active.");
		app.use("/api/*", rateLimiter({ windowSecs: 60, limit: 100 }));
	} else {
		console.log("⚪️ Rate limiter is inactive in test mode.");
	}

	app.use(requestId());
	app.onError(onError);
	app.notFound(notFound);
	return app;
}
