import type { PaginatedData } from "@/core/base/types";
import { categories } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { Filter } from "./types";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";

export type Category = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;

export class CategoryRepository extends SoftDeleteMixin {
	constructor() {
		super(categories, {
			latest: desc(categories.createdAt),
		});
	}

	async get(filter: Filter): Promise<PaginatedData> {
		const filtersBuilder = this.filterBuilder(filter);
		const searchBuilder = filter.search
			? this.searchBuilder(filter.search, ["name"])
			: null;

		const whereCondition = and(
			...filtersBuilder,
			...(searchBuilder ? [searchBuilder] : []),
			isNull(categories.deletedAt),
		);

		const query = this.db
			.select({
				id: categories.id,
				name: categories.name,
				createdAt: categories.createdAt,
			})
			.from(this.table)
			.where(whereCondition);

		return await this.withPagination(
			query.$dynamic(),
			filter.orderBy,
			undefined,
			filter.page,
			filter.pageSize,
		);
	}

	async byId(id: number): Promise<{ data: Category } | null> {
		const query = await this.db.query.categories.findFirst({
			where: and(eq(categories.id, id), isNull(categories.deletedAt)),
			columns: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
			},
		});

		if (!query) return null;
		return { data: query };
	}

	async create(data: CategoryInsert): Promise<{ data: Category } | null> {
		const query = (await this.db
			.insert(this.table)
			.values(data)
			.returning()) as Category[];
		if (!query || !query[0]) return null;

		return { data: query[0] };
	}

	async update(
		id: number,
		data: Partial<CategoryInsert>,
	): Promise<{ data: Category } | null> {
		const [result] = (await this.db
			.update(this.table)
			.set(data)
			.where(eq(categories.id, id))
			.returning()) as Category[];
		if (!result) return null;

		return { data: result };
	}
}
