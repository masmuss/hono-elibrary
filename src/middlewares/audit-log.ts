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

			const db = createDrizzle();
			await db.insert(auditLogs).values({
				userId: user ? user.id : null,
				action: options.action,
				status: error ? "FAILED" : "SUCCESS",
				payload: requestBody,
				dbQuery: queries.join("\n---\n"),
				ipAddress: ip,
				userAgent: userAgent,
			});
		}
	};
};

// kita perlu modifikasi handler agar bisa menggunakan db dari context
// Buat tipe baru di src/lib/types.ts
declare module "hono" {
	interface ContextVariableMap {
		dbWithLogger: ReturnType<typeof createDrizzle>;
	}
}
