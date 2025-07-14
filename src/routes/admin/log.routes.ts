import { BaseRoutes } from "@/core/base/base-routes";
import {
	getAllAuditLogsQuerySchema,
	getAllAuditLogsSuccessResponse,
} from "@/core/schemas/admin.log.schema";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { AdminEvent } from "@/lib/constants/enums/audit-log-events.enum";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { auditLog } from "@/middlewares/audit-log";
import { authMiddleware } from "@/middlewares/auth";
import { authorizeRole } from "@/middlewares/authorization";
import { createRoute } from "@hono/zod-openapi";

export class AdminLogRoutes extends BaseRoutes {
	getAuditLogs = createRoute({
		tags: ["Admin - Audit Logs"],
		description: "Get all audit logs (Admin only)",
		path: "/logs",
		method: "get",
		request: {
			headers: authHeadersSchema,
			query: getAllAuditLogsQuerySchema,
		},
		middleware: [
			authMiddleware,
			authorizeRole([UserRole.ADMIN]),
			auditLog({ action: AdminEvent.ADMIN_VIEW_AUDIT_LOGS }),
		],
		responses: {
			200: this.successResponse(
				getAllAuditLogsSuccessResponse,
				"Audit logs retrieved successfully",
			),
			403: this.errorResponse("Forbidden"),
		},
	});
}

export type GetAuditLogsRoute = typeof AdminLogRoutes.prototype.getAuditLogs;
