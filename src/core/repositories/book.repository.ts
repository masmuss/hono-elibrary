import { BaseRepository } from "@/core/base/base-repository";
import type { Repository } from "@/core/interfaces/repository.interface";
import { books } from "@/db/schema";
import type { Book } from "@/lib/types";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { PaginatedData } from "../base/types";
import type { Filter } from "./types";

export class BookRepository extends BaseRepository implements Repository {
	constructor() {
		super(books, {
			latest: desc(books.createdAt),
		});
	}

	async get(filter: Partial<Book> & Filter): Promise<PaginatedData> {
		const filtersBuilder = this.filterBuilder(filter);
		const searchBuilder = filter.search
			? this.searchBuilder(filter.search, [
					"title",
					"author",
					"publisher",
					"isbn",
				])
			: null;

		const whereCondition = and(
			isNull(books.deletedAt),
			...filtersBuilder,
			...(searchBuilder ? [searchBuilder] : []),
		);

		const query = this.db
			.select({
				id: books.id,
				title: books.title,
				isbn: books.isbn,
				stock: books.stock,
				author: books.author,
				createdAt: books.createdAt,
			})
			.from(this.table)
			.where(whereCondition);

		return await this.withPagination(
			query.$dynamic(),
			filter.orderBy,
			whereCondition,
			filter.page,
			filter.pageSize,
		);
	}

	async byId(id: number): Promise<{ data: Book } | null> {
		const query = await this.db.query.books.findFirst({
			where: and(eq(books.id, id), isNull(books.deletedAt)),
			with: {
				category: {
					columns: {
						name: true,
					},
				},
			},
		});

		if (!query) return null;
		return { data: query };
	}
}
