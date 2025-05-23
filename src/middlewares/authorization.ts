import type { MiddlewareHandler } from "hono";

export function authorizeRole(allowedRoles: string[]): MiddlewareHandler {
	return async (c, next) => {
		const user = c.get("user");
		if (!user || !allowedRoles.includes(user.role)) {
			return c.json({ message: "Forbidden: insufficient permissions" }, 403);
		}
		await next();
	};
}
