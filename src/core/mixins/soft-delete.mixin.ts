import { BaseRepository } from "@/core/base/base-repository";
import { eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { PaginatedData } from "../base/types";
import type { Filter } from "../repositories/types";
import { APIError } from "../helpers/api-error";

export class SoftDeleteMixin extends BaseRepository {
	async softDelete(id: string | number): Promise<{ data: any }> {
		const deletedAt = new Date();
		const [result] = await this.db
			.update(this.table)
			.set({ deletedAt })
			.where(eq((this.table as any).id, id))
			.returning();

		if (!result) {
			throw new APIError(404, "Record not found to delete", "RECORD_NOT_FOUND");
		}
		return { data: result };
	}

	async restore(id: string | number): Promise<{ data: any }> {
		const [result] = await this.db
			.update(this.table)
			.set({ deletedAt: null })
			.where(eq((this.table as any).id, id))
			.returning();

		if (!result) {
			throw new APIError(
				404,
				"Record not found to restore",
				"RECORD_NOT_FOUND",
			);
		}
		return { data: result };
	}

	async hardDelete(id: string | number): Promise<{ data: any }> {
		const [result] = await this.db
			.delete(this.table)
			.where(eq((this.table as any).id, id))
			.returning();

		if (!result) {
			throw new APIError(
				404,
				"Record not found to permanently delete",
				"RECORD_NOT_FOUND",
			);
		}
		return { data: result };
	}

	async get(
		filter: Partial<InferSelectModel<typeof this.table> & Filter>,
	): Promise<PaginatedData> {
		const filtersBuilder = this.filterBuilder(filter);
		const whereCondition = sql`${sql.join(filtersBuilder, " AND ")} AND ${sql`${(this.table as any).deletedAt} IS NULL`}`;
		const query = this.db.select().from(this.table).where(whereCondition);

		return await this.withPagination(
			query.$dynamic(),
			filter.orderBy,
			whereCondition,
			filter.page,
			filter.pageSize,
		);
	}
}
