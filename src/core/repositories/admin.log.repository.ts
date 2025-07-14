import { BaseRepository } from "@/core/base/base-repository";
import type { PaginatedData } from "@/core/base/types";
import { auditLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import type { Filter } from "./types";
import type { DbInstance } from "../types/db";

export class AdminLogRepository extends BaseRepository {
	constructor() {
		super(auditLogs, {
			latest: desc(auditLogs.createdAt),
		});
	}

	async getLogs(
		filter: Filter,
		dbInstance?: DbInstance,
	): Promise<PaginatedData> {
		const page = filter.page || 1;
		const pageSize = filter.pageSize || 15;

		const db = dbInstance || this.db;
		const logData = await db.query.auditLogs.findMany({
			orderBy: [desc(auditLogs.createdAt)],
			limit: pageSize,
			offset: (page - 1) * pageSize,
			with: {
				user: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});

		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(auditLogs);

		const total = totalResult[0].count;
		const totalPages = Math.ceil(total / pageSize);

		return {
			data: logData,
			total: Number.parseInt(total.toString()),
			totalPages,
			page,
		};
	}
}
