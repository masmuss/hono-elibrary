import type { PaginatedData } from "@/core/base/types";
import { books, categories } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { Filter } from "./types";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import { APIError } from "../helpers/api-error";

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

	async byId(id: number): Promise<{ data: Category }> {
		const [result] = (await this.db
			.select()
			.from(this.table)
			.where(eq(categories.id, id))) as Category[];
		if (!result) {
			throw new APIError(404, "Category not found", "CATEGORY_NOT_FOUND");
		}
		return { data: result };
	}

	async create(data: CategoryInsert): Promise<{ data: Category } | null> {
		const query = (await this.db
			.insert(this.table)
			.values(data)
			.returning()) as Category[];
		if (query.length === 0) {
			throw new APIError(
				400,
				"Failed to create category",
				"CATEGORY_CREATION_FAILED",
			);
		}

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
		if (!result) {
			throw new APIError(404, "Category not found", "CATEGORY_NOT_FOUND");
		}

		return { data: result };
	}

	async hardDelete(id: number): Promise<{ data: Category }> {
		const bookUsingCategory = await this.db.query.books.findFirst({
			where: eq(books.categoryId, id),
		});
		if (bookUsingCategory) {
			throw new APIError(
				400,
				"Cannot delete category: It is currently in use by one or more books.",
				"CATEGORY_IN_USE",
			);
		}
		const [result] = (await this.db
			.delete(this.table)
			.where(eq(categories.id, id))
			.returning()) as Category[];
		if (!result) {
			throw new APIError(404, "Category not found", "CATEGORY_NOT_FOUND");
		}
		return { data: result };
	}
}
