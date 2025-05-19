import { BaseRepository } from "@/core/base/base-repository";
import { eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { PaginatedData, ResponseData } from "../base/types";
import type { Filter } from "../repositories/types";

export class SoftDeleteMixin extends BaseRepository {
	async softDelete(id: string | number): Promise<ResponseData> {
		const deletedAt = new Date();
		const result = await this.db
			.update(this.table)
			.set({ deletedAt })
			.where(eq((this.table as any).id, id))
			.returning();

		if (result.length <= 0) return null;

		return { data: result[0] };
	}

	async restore(id: string | number): Promise<ResponseData> {
		const result = await this.db
			.update(this.table)
			.set({ deletedAt: null })
			.where(eq((this.table as any).id, id))
			.returning();

		if (result.length <= 0) return null;

		return { data: result[0] };
	}

	async hardDelete(id: string | number): Promise<ResponseData> {
		const result = await this.db
			.delete(this.table)
			.where(eq((this.table as any).id, id))
			.returning();

		if (result.length <= 0) return null;

		return { data: result[0] };
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
