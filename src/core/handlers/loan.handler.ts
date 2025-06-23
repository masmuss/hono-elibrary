import type { AppRouteHandler } from "@/lib/types";
import type {
	LoanAll,
	LoanApprove,
	LoanCreate,
	LoanReject,
	LoanReturn,
	MyLoans,
} from "@/routes/loan/loan.routes";
import { BaseHandler } from "../base/base-handler";
import { LoanRepository } from "../repositories/loan.repository";
import { MemberRepository } from "../repositories/member.repository";
import { APIError } from "../helpers/api-error";

export class LoanHandler extends BaseHandler {
	constructor() {
		super(new LoanRepository());
	}

	getMyLoans: AppRouteHandler<MyLoans> = async (c) => {
		const user = c.get("user");
		const filter = c.req.valid("query");

		const memberRepo = new MemberRepository();
		const member = await memberRepo.findByUserId(user.id);

		if (!member) {
			throw new APIError(
				404,
				"Member profile not found for this user",
				"MEMBER_PROFILE_NOT_FOUND",
			);
		}

		const loans = await this.repository.getLoansByMemberId(member.id, filter);
		return c.json(
			this.buildSuccessResponse(loans, "User's loans retrieved successfully"),
			200,
		);
	};

	getAllLoans: AppRouteHandler<LoanAll> = async (c) => {
		const filter = c.req.valid("query");
		const loans = await this.repository.getAllLoans(filter);
		return c.json(
			this.buildSuccessResponse(loans, "Loans retrieved successfully"),
			200,
		);
	};

	createLoan: AppRouteHandler<LoanCreate> = async (c) => {
		const body = c.req.valid("json");
		const loan = await this.repository.createLoan(body.memberId, body.bookId);
		return c.json(
			this.buildSuccessResponse({ data: loan }, "Loan created successfully"),
			201,
		);
	};

	approveLoan: AppRouteHandler<LoanApprove> = async (c) => {
		const { id } = c.req.valid("param");
		const librarianId = c.get("user").id;
		const loan = await this.repository.approveLoan(id, librarianId);
		return c.json(
			this.buildSuccessResponse(loan, "Loan approved successfully"),
			200,
		);
	};

	rejectLoan: AppRouteHandler<LoanReject> = async (c) => {
		const { id } = c.req.valid("param");
		const librarianId = c.get("user").id;
		const loan = await this.repository.rejectLoan(id, librarianId);
		return c.json(
			this.buildSuccessResponse(loan, "Loan rejected successfully"),
			200,
		);
	};

	returnLoan: AppRouteHandler<LoanReturn> = async (c) => {
		const { id } = c.req.valid("param");
		const loan = await this.repository.returnLoan(id);
		return c.json(
			this.buildSuccessResponse({ data: loan }, "Loan returned successfully"),
			200,
		);
	};
}
