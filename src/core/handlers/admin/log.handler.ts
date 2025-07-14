import { BaseHandler } from "@/core/base/base-handler";
import { AdminLogRepository } from "@/core/repositories/admin.log.repository";
import type { AppRouteHandler } from "@/lib/types";
import type { GetAuditLogsRoute } from "@/routes/admin/log.routes";

export class AdminLogHandler extends BaseHandler {
	constructor() {
		super(new AdminLogRepository());
	}

	getLogs: AppRouteHandler<GetAuditLogsRoute> = async (c) => {
		const filter = c.req.valid("query");
		const db = c.get("dbWithLogger") || this.repository.db;
		const logs = await this.repository.getLogs(filter, db);
		return c.json(
			this.buildSuccessResponse(logs, "Audit logs retrieved successfully"),
			200,
		);
	};
}
