import type { AppRouteHandler } from "@/lib/types";
import type {
	LoanAll,
	LoanApprove,
	LoanCreate,
	LoanReject,
	LoanReturn,
} from "@/routes/loan/loan.routes";
import { BaseHandler } from "../base/base-handler";
import { LoanRepository } from "../repositories/loan.repository";

export class LoanHandler extends BaseHandler {
	constructor() {
		super(new LoanRepository());
	}

	getAllLoans: AppRouteHandler<LoanAll> = async (c) => {
		try {
			const filter = c.req.valid("query");
			const loans = await this.repository.getAllLoans(filter);

			return c.json(
				this.responseBuilder(loans, "Loans retrieved successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to retrieve loans", error as Error),
			);
		}
	};

	createLoan: AppRouteHandler<LoanCreate> = async (c) => {
		try {
			const body = c.req.valid("json");

			if (!body) {
				throw new Error("Invalid request body");
			}

			const { memberId, bookId } = body;

			if (!memberId || !bookId) {
				throw new Error("Missing required fields");
			}
			const loan = await this.repository.createLoan(memberId, bookId);

			return c.json(
				this.responseBuilder({ data: loan }, "Loan created successfully"),
				201,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to create loan", error as Error),
				400,
			);
		}
	};

	approveLoan: AppRouteHandler<LoanApprove> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const librarianId = c.get("user").id;

			const loan = await this.repository.approveLoan(id, librarianId);

			if (!loan) {
				throw new Error("Failed to approve loan");
			}

			return c.json(
				this.responseBuilder(loan, "Loan approved successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to approve loan", error as Error),
				400,
			);
		}
	};

	rejectLoan: AppRouteHandler<LoanReject> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const librarianId = c.get("user").id;

			const loan = await this.repository.rejectLoan(id, librarianId);

			if (!loan) {
				throw new Error("Failed to reject loan");
			}

			return c.json(
				this.responseBuilder(loan, "Loan rejected successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to reject loan", error as Error),
				400,
			);
		}
	};

	returnLoan: AppRouteHandler<LoanReturn> = async (c) => {
		try {
			const { id } = c.req.valid("param");

			if (!id) {
				throw new Error("Invalid request body");
			}

			const loan = await this.repository.returnLoan(id);

			if (!loan) {
				throw new Error("Failed to return loan");
			}

			return c.json(
				this.responseBuilder(loan, "Loan returned successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to return loan", error as Error),
				400,
			);
		}
	};
}
