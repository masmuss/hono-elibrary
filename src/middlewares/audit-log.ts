import { createDrizzle, QueryLogger } from "@/db";
import { auditLogs } from "@/db/schema";
import type { MiddlewareHandler } from "hono";

type AuditLogOptions = {
	action: string;
};

export const auditLog = (options: AuditLogOptions): MiddlewareHandler => {
	return async (c, next) => {
		const user = c.get("user");
		const ip = c.req.header("x-forwarded-for") || "127.0.0.1";
		const userAgent = c.req.header("user-agent");
		const correlationId = c.get("requestId");
		let requestBody: any;

		try {
			requestBody = await c.req.json();
		} catch (e) {
			requestBody = null;
		}

		const queryLogger = new QueryLogger();
		const dbWithLogger = createDrizzle(queryLogger);
		c.set("dbWithLogger", dbWithLogger);

		let error: Error | null = null;
		try {
			await next();
		} catch (e: any) {
			error = e;
			throw e;
		} finally {
			const queries = queryLogger.getQueries();

			const isSuccess = !error && c.res.status >= 200 && c.res.status < 300;

			const db = createDrizzle();
			await db.insert(auditLogs).values({
				correlationId: correlationId,
				userId: user ? user.id : null,
				action: options.action,
				status: isSuccess ? "SUCCESS" : "FAILED",
				payload: requestBody,
				dbQuery: queries.join("\n---\n"),
				ipAddress: ip,
				userAgent: userAgent,
			});
		}
	};
};

declare module "hono" {
	interface ContextVariableMap {
		dbWithLogger: ReturnType<typeof createDrizzle>;
	}
}
