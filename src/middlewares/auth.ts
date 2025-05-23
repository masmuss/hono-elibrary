import envRuntime from "@/config/env-runtime";
import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");
	try {
		const payload = await verify(token, envRuntime.JWT_SECRET);
		c.set("user", payload);
		await next();
	} catch {
		return c.json({ message: "Invalid or expired token" }, 401);
	}
};
