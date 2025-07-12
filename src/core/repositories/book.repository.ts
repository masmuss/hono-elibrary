import type { Repository } from "@/core/interfaces/repository.interface";
import { books } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { PaginatedData } from "../base/types";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Book, BookInsert, BookUpdate } from "../types/book";
import type { Filter } from "./types";
import { APIError } from "../helpers/api-error";
import { CacheKeys } from "@/lib/constants/cache-keys";
import redisClient from "@/lib/redis";
import type { DbInstance } from "../types/db";

export class BookRepository extends SoftDeleteMixin implements Repository {
	constructor() {
		super(books, {
			latest: desc(books.createdAt),
		});
	}

	async get(
		filter: Partial<Book> & Filter,
		dbInstance?: DbInstance,
	): Promise<PaginatedData> {
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

		const db = dbInstance ?? this.db;
		const query = db
			.select({
				id: books.id,
				title: books.title,
				isbn: books.isbn,
				totalCopies: books.totalCopies,
				availableCopies: books.availableCopies,
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

	async byId(id: number, dbInstance?: DbInstance): Promise<{ data: Book }> {
		const cacheKey = CacheKeys.BOOKS.BY_ID(id);

		const cachedBook = await redisClient.get(cacheKey);
		if (cachedBook) {
			return JSON.parse(cachedBook);
		}

		const db = dbInstance ?? this.db;
		const query = await db.query.books.findFirst({
			where: and(eq(books.id, id), isNull(books.deletedAt)),
			with: {
				category: {
					columns: {
						name: true,
					},
				},
			},
		});

		if (!query) {
			throw new APIError(404, "Book not found", "BOOK_NOT_FOUND");
		}
		const result = { data: query };

		redisClient.set(cacheKey, JSON.stringify(result.data), "EX", 3600);

		return result;
	}

	async create(
		book: BookInsert,
		dbInstance?: DbInstance,
	): Promise<{ data: Book }> {
		const db = dbInstance ?? this.db;
		const [query] = await db.insert(books).values(book).returning();
		if (!query) {
			throw new APIError(500, "Failed to create book record");
		}

		await redisClient.del(CacheKeys.BOOKS.PAGINATED(1, 10));

		return { data: query };
	}

	async update(
		id: number,
		book: BookUpdate,
		dbInstance?: DbInstance,
	): Promise<{ data: Book }> {
		const db = dbInstance ?? this.db;
		const [query] = await db
			.update(books)
			.set(book)
			.where(and(eq(books.id, id), isNull(books.deletedAt)))
			.returning();

		if (!query) {
			throw new APIError(404, "Book not found to update", "BOOK_NOT_FOUND");
		}

		await redisClient.del(CacheKeys.BOOKS.BY_ID(id));

		return { data: query };
	}
}
