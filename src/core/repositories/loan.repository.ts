import { books, loans } from "@/db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Loan, LoanQueryResult } from "../types/loan";
import type { Filter } from "./types";
import { APIError } from "../helpers/api-error";

export class LoanRepository extends SoftDeleteMixin {
	constructor() {
		super(loans, {
			latest: desc(loans.createdAt),
		});
	}

	private async getLoanDetails(
		loanId: string,
		trx?: any,
	): Promise<LoanQueryResult> {
		const dbInstance = trx || this.db;
		return await dbInstance.query.loans.findFirst({
			where: eq(loans.id, loanId),
			columns: {
				id: true,
				loanDate: true,
				dueDate: true,
				status: true,
				returnedAt: true,
			},
			with: {
				book: {
					columns: {
						title: true,
						isbn: true,
						author: true,
						publisher: true,
					},
				},
				member: {
					columns: {},
					with: {
						user: {
							columns: {
								name: true,
							},
						},
					},
				},
				librarian: {
					// Selalu sertakan untuk konsistensi, bisa difilter nanti jika tidak perlu
					columns: {
						name: true,
						email: true,
					},
				},
			},
		});
	}

	async getAllLoans(filter: Partial<Loan> & Filter) {
		const filtersBuilder = this.filterBuilder(filter);
		const searchBuilder = filter.search
			? this.searchBuilder(filter.search, ["memberId"])
			: undefined;

		const whereConditions = [
			isNull(loans.deletedAt),
			...filtersBuilder,
			searchBuilder,
		].filter(Boolean);

		const whereCondition =
			whereConditions.length > 0 ? and(...whereConditions) : undefined;

		const query = await this.db.query.loans.findMany({
			where: whereCondition,
			columns: {
				id: true,
				loanDate: true,
				dueDate: true,
				returnedAt: true,
				status: true,
			},
			with: {
				book: {
					columns: {
						title: true,
						isbn: true,
						author: true,
						publisher: true,
					},
				},
				member: {
					columns: {},
					with: {
						user: {
							columns: {
								name: true,
							},
						},
					},
				},
				librarian: {
					columns: {
						name: true,
						email: true,
					},
				},
			},
		});

		return { data: query };
	}

	async getLoansByMemberId(memberId: string, filter: Filter) {
		const query = this.db.query.loans.findMany({
			where: and(eq(loans.memberId, memberId), isNull(loans.deletedAt)),
			orderBy: [desc(loans.loanDate)],
			limit: filter.pageSize || 10,
			offset: ((filter.page || 1) - 1) * (filter.pageSize || 10),
			columns: {
				id: true,
				loanDate: true,
				dueDate: true,
				returnedAt: true,
				status: true,
			},
			with: {
				book: {
					columns: {
						title: true,
						isbn: true,
						author: true,
					},
				},
			},
		});

		const totalQuery = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(this.table)
			.where(eq(loans.memberId, memberId));
		const total = totalQuery[0].count;
		const totalPages = Math.ceil(total / (filter.pageSize || 10));

		return {
			data: await query,
			total,
			totalPages,
			page: filter.page || 1,
		};
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

	async createLoan(memberId: string, bookId: number): Promise<LoanQueryResult> {
		if (await this.hasActiveLoan(memberId, bookId)) {
			throw new APIError(
				400,
				"Member is already borrowing this book.",
				"LOAN_ACTIVE_EXISTS",
			);
		}

		return await this.db.transaction(async (trx) => {
			const book = await trx.query.books.findFirst({
				where: eq(books.id, bookId),
				columns: { availableCopies: true },
			});

			if (!book) {
				throw new APIError(404, "Book not found.", "BOOK_NOT_FOUND");
			}
			if (book.availableCopies < 1) {
				throw new APIError(400, "Book is out of stock.", "BOOK_OUT_OF_STOCK");
			}

			await trx
				.update(books)
				.set({ availableCopies: sql`${books.availableCopies} - 1` })
				.where(eq(books.id, bookId));

			const [insertedLoan] = await trx
				.insert(loans)
				.values({ memberId, bookId })
				.returning({ id: loans.id });

			if (!insertedLoan || !insertedLoan.id) {
				throw new APIError(
					500,
					"Failed to create loan.",
					"LOAN_CREATION_FAILED",
				);
			}

			const newLoanDetails = await this.getLoanDetails(insertedLoan.id, trx);
			if (!newLoanDetails) {
				throw new APIError(
					500,
					"Failed to fetch loan details after creation.",
					"LOAN_FETCH_FAILED",
				);
			}
			return newLoanDetails;
		});
	}

	private async findLoanForModification(
		loanId: string,
		trx: any,
	): Promise<Loan> {
		const loan = await trx.query.loans.findFirst({
			where: eq(loans.id, loanId),
		});
		if (!loan) {
			throw new Error("Loan not found.");
		}
		if (loan.returnedAt) {
			throw new Error("Loan has already been returned.");
		}

		if (loan.status === "rejected" || loan.status === "approved") {
			throw new Error(
				`Loan cannot be modified because its status is: ${loan.status}.`,
			);
		}
		return loan;
	}

	async approveLoan(
		loanId: string,
		librarianId: string,
	): Promise<{ data: LoanQueryResult }> {
		return await this.db.transaction(async (trx) => {
			const loan = await trx.query.loans.findFirst({
				where: eq(loans.id, loanId),
			});
			if (!loan) throw new APIError(404, "Loan not found.", "LOAN_NOT_FOUND");
			if (loan.status !== "pending")
				throw new APIError(
					400,
					`Loan cannot be approved because its status is: ${loan.status}.`,
					"LOAN_STATUS_INVALID",
				);

			await trx
				.update(loans)
				.set({
					status: "approved",
					librarianId,
					dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
					approvedAt: new Date(),
				})
				.where(eq(loans.id, loanId));

			const updatedLoanDetails = await this.getLoanDetails(loanId, trx);
			if (!updatedLoanDetails)
				throw new APIError(500, "Failed to fetch loan details after approval.");

			return { data: updatedLoanDetails };
		});
	}

	async rejectLoan(
		loanId: string,
		librarianId: string,
	): Promise<{ data: LoanQueryResult }> {
		return await this.db.transaction(async (trx) => {
			const loan = await this.findLoanForModification(loanId, trx);

			const book = await trx.query.books.findFirst({
				where: eq(books.id, loan.bookId),
				columns: { id: true },
			});

			if (book) {
				await trx
					.update(books)
					.set({ availableCopies: sql`${books.availableCopies} + 1` })
					.where(eq(books.id, loan.bookId));
			}

			await trx
				.update(loans)
				.set({
					status: "rejected",
					librarianId,
				})
				.where(eq(loans.id, loanId));

			const updatedLoanDetails = await this.getLoanDetails(loanId, trx);
			if (!updatedLoanDetails) {
				throw new Error("Failed to fetch loan details after rejection.");
			}
			return { data: updatedLoanDetails };
		});
	}

	async returnLoan(loanId: string): Promise<LoanQueryResult> {
		return await this.db.transaction(async (trx) => {
			const loan = await trx.query.loans.findFirst({
				where: eq(loans.id, loanId),
				columns: { id: true, returnedAt: true, bookId: true, status: true },
			});

			if (!loan) throw new APIError(404, "Loan not found.", "LOAN_NOT_FOUND");
			if (loan.returnedAt)
				throw new APIError(
					400,
					"Loan has already been returned.",
					"LOAN_ALREADY_RETURNED",
				);
			if (loan.status !== "approved")
				throw new APIError(
					400,
					`Loan cannot be returned because its status is: ${loan.status}.`,
					"LOAN_STATUS_INVALID",
				);

			await trx
				.update(books)
				.set({ availableCopies: sql`${books.availableCopies} + 1` })
				.where(eq(books.id, loan.bookId));

			await trx
				.update(loans)
				.set({
					returnedAt: new Date().toLocaleDateString(),
					status: "returned",
				})
				.where(eq(loans.id, loanId));

			const updatedLoanDetails = await this.getLoanDetails(loanId, trx);
			if (!updatedLoanDetails)
				throw new APIError(500, "Failed to fetch loan details after return.");

			return updatedLoanDetails;
		});
	}
}
