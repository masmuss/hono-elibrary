import { books, loans } from "@/db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Loan, LoanQueryResult } from "../types/loan";
import type { Filter } from "./types";

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
			throw new Error("Anggota sudah memiliki pinjaman aktif untuk buku ini.");
		}

		return await this.db.transaction(async (trx) => {
			const book = await trx.query.books.findFirst({
				where: eq(books.id, bookId),
				columns: { availableCopies: true },
			});

			if (!book) {
				throw new Error("Buku tidak ditemukan.");
			}
			if (book.availableCopies < 1) {
				throw new Error("Stok buku habis. Silakan coba lagi nanti.");
			}

			const [insertedLoan] = await trx
				.insert(loans)
				.values({
					memberId,
					bookId,
				})
				.returning({ id: loans.id });

			if (!insertedLoan || !insertedLoan.id) {
				throw new Error("Gagal membuat data pinjaman.");
			}

			const newLoanDetails = await this.getLoanDetails(insertedLoan.id, trx);
			if (!newLoanDetails) {
				throw new Error("Gagal mengambil detail pinjaman setelah pembuatan.");
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
			throw new Error("Peminjaman tidak ditemukan.");
		}
		if (loan.returnedAt) {
			throw new Error("Peminjaman sudah dikembalikan.");
		}

		if (loan.status === "rejected" || loan.status === "approved") {
			throw new Error(`Peminjaman sudah dalam status: ${loan.status}.`);
		}
		return loan;
	}

	async approveLoan(
		loanId: string,
		librarianId: string,
	): Promise<{ data: LoanQueryResult }> {
		return await this.db.transaction(async (trx) => {
			const loan = await this.findLoanForModification(loanId, trx);

			const book = await trx.query.books.findFirst({
				where: eq(books.id, loan.bookId),
				columns: { availableCopies: true, id: true },
			});

			if (!book) {
				throw new Error("Buku terkait peminjaman tidak ditemukan.");
			}

			if (book.availableCopies < 1) {
				await trx
					.update(books)
					.set({ availableCopies: sql`${books.availableCopies} - 1` })
					.where(eq(books.id, loan.bookId));
			}

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
			if (!updatedLoanDetails) {
				throw new Error("Gagal mengambil detail pinjaman setelah persetujuan.");
			}
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
				throw new Error("Gagal mengambil detail pinjaman setelah penolakan.");
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

			if (!loan) {
				throw new Error("Peminjaman tidak ditemukan.");
			}
			if (loan.returnedAt) {
				throw new Error("Peminjaman sudah dikembalikan sebelumnya.");
			}

			if (loan.status !== "approved") {
				throw new Error(
					`Peminjaman tidak dapat dikembalikan karena statusnya: ${loan.status}.`,
				);
			}

			await trx
				.update(books)
				.set({ availableCopies: sql`${books.availableCopies} + 1` })
				.where(eq(books.id, loan.bookId));

			const returnedDate = new Date().toISOString();
			await trx
				.update(loans)
				.set({
					returnedAt: returnedDate,
					status: "returned",
				})
				.where(eq(loans.id, loanId));

			const updatedLoanDetails = await this.getLoanDetails(loanId, trx);

			if (!updatedLoanDetails) {
				throw new Error(
					"Gagal mengambil detail pinjaman setelah pengembalian.",
				);
			}

			return updatedLoanDetails;
		});
	}
}
