import { books, loans } from "@/db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { PaginatedData } from "../base/types";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Loan } from "../types/loan";
import type { Filter } from "./types";

export class LoanRepository extends SoftDeleteMixin {
	constructor() {
		super(loans, {
			latest: desc(loans.createdAt),
		});
	}

	async getAllLoans(filter: Partial<Loan> & Filter): Promise<PaginatedData> {
		const filtersBuilder = this.filterBuilder(filter);
		const searchBuilder = filter.search
			? this.searchBuilder(filter.search, ["memberId"])
			: null;

		const whereConditions = [
			isNull(loans.deletedAt),
			...filtersBuilder,
			...(searchBuilder ? [searchBuilder] : []),
		].filter(Boolean);

		const whereCondition =
			whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

		const query = this.db
			.select({
				id: loans.id,
				memberId: loans.memberId,
				bookId: loans.bookId,
				returnDate: loans.returnDate,
				returnedAt: loans.returnedAt,
				createdAt: loans.createdAt,
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

	async hasActiveLoan(memberId: string, bookId: number): Promise<boolean> {
		const activeLoan = await this.db.query.loans.findFirst({
			where: and(
				eq(loans.memberId, memberId),
				eq(loans.bookId, bookId),
				isNull(loans.returnedAt),
			),
		});
		return !!activeLoan;
	}

	async createLoan(
		memberId: string,
		bookId: number,
		returnDate: Date,
	): Promise<Loan | null> {
		const alreadyLoaned = await this.hasActiveLoan(memberId, bookId);
		if (alreadyLoaned) {
			throw new Error("You already have an active loan for this book");
		}

		return await this.db.transaction(async (trx) => {
			const book = await trx.query.books.findFirst({
				where: eq(books.id, bookId),
			});
			if (!book || book.stock < 1) {
				throw new Error("Book is out of stock");
			}

			await trx
				.update(books)
				.set({ stock: book.stock - 1 })
				.where(eq(books.id, bookId));

			const loan = await trx
				.insert(loans)
				.values({
					memberId,
					bookId,
					returnDate: returnDate.toString(),
				})
				.returning();

			return loan[0];
		});
	}

	async returnLoan(loanId: string): Promise<Loan | null> {
		return await this.db.transaction(async (trx) => {
			const loan = await trx.query.loans.findFirst({
				where: eq(loans.id, loanId),
			});
			if (!loan || loan.returnedAt) {
				throw new Error("Loan not found or already returned");
			}

			await trx
				.update(books)
				.set({ stock: sql`${books.stock} + 1` })
				.where(eq(books.id, loan.bookId));

			await trx
				.update(loans)
				.set({ returnedAt: new Date().toISOString() })
				.where(eq(loans.id, loanId));

			const updatedLoan = await trx.query.loans.findFirst({
				where: eq(loans.id, loanId),
			});

			return updatedLoan ?? null;
		});
	}
}
