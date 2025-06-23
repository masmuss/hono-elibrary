import type { loans } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { Book } from "./book";
import type { User } from "./user";

export type Loan = InferSelectModel<typeof loans>;
export type LoanCreate = InferInsertModel<typeof loans>;
export type LoanUpdate = Partial<LoanCreate>;

export type LoanDetails = Loan & {
	book: Book | null;
	member: {
		user: Pick<User, "name"> | null;
	} | null;
	librarian: Pick<User, "name" | "email"> | null;
};

export type LoanQueryResult = {
	id: string;
	loanDate: Date | null;
	dueDate: Date | null;
	returnedAt: Date | null;
	status: "pending" | "approved" | "rejected" | "returned";
	book: {
		title: string;
		isbn: string | null;
		author: string | null;
		publisher: string | null;
	} | null;
	member: {
		user: {
			name: string | null;
		} | null;
	} | null;
	librarian?: {
		// Opsional karena tidak semua query membutuhkannya
		name: string | null;
		email: string;
	} | null;
} | null;
