import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import {
	UUIDParamSchema,
	paginationQuerySchema,
	searchQuerySchema,
} from "@/core/helpers/schemas";
import { errorResponse } from "@/core/schemas/errors.schema";
import {
	getAllLoansSuccessResponse,
	getLoanSuccessResponse,
} from "@/core/schemas/loan.schema";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { createLoanSchema } from "@/core/validations/loan.validation";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { authMiddleware } from "@/middlewares/auth";
import { authorizeRole } from "@/middlewares/authorization";
import { createRoute } from "@hono/zod-openapi";

export class LoanRoutes extends BaseRoutes {
	allLoans = createRoute({
		tags: ["Loan"],
		description: "Get all loans",
		path: "/loans",
		method: "get",
		request: {
			headers: authHeadersSchema,
			query: searchQuerySchema,
		},
		middleware: [
			authMiddleware,
			authorizeRole([UserRole.ADMIN, UserRole.LIBRARIAN]),
		],
		responses: {
			[200]: this.successResponse(
				getAllLoansSuccessResponse,
				"Loans retrieved successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request body"),
		},
	});

	myLoans = createRoute({
		tags: ["Loan"],
		description: "Get all loans for the currently authenticated member",
		path: "/loans/my-loans",
		method: "get",
		request: {
			headers: authHeadersSchema,
			query: paginationQuerySchema,
		},
		middleware: [authMiddleware],
		responses: {
			200: this.successResponse(
				getAllLoansSuccessResponse,
				"User's loans retrieved successfully",
			),
			401: this.errorResponse(errorResponse, "Unauthorized"),
			404: this.errorResponse(errorResponse, "Member profile not found"),
			500: this.errorResponse(errorResponse, "Internal Server Error"),
		},
	});

	create = createRoute({
		tags: ["Loan"],
		description: "Create a new loan",
		path: "/loans",
		method: "post",
		request: {
			headers: authHeadersSchema,
			body: jsonContentRequired(createLoanSchema, "Create a new loan payload"),
		},
		middleware: [
			authMiddleware,
			authorizeRole([UserRole.MEMBER, UserRole.LIBRARIAN]),
		],
		responses: {
			[201]: this.successResponse(
				getLoanSuccessResponse,
				"Loan created successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request body"),
		},
	});

	approve = createRoute({
		tags: ["Loan"],
		description: "Approve a loan",
		path: "/loans/{id}/approve",
		method: "post",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.LIBRARIAN])],
		responses: {
			[200]: this.successResponse(
				getLoanSuccessResponse,
				"Loan approved successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request body"),
			[404]: this.errorResponse(errorResponse, "Loan not found"),
		},
	});

	reject = createRoute({
		tags: ["Loan"],
		description: "Reject a loan",
		path: "/loans/{id}/reject",
		method: "post",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.LIBRARIAN])],
		responses: {
			[200]: this.successResponse(
				getLoanSuccessResponse,
				"Loan rejected successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request body"),
			[404]: this.errorResponse(errorResponse, "Loan not found"),
		},
	});

	return = createRoute({
		tags: ["Loan"],
		description: "Return a loan",
		path: "/loans/{id}/return",
		method: "post",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
		},
		middleware: [
			authMiddleware,
			authorizeRole([UserRole.MEMBER, UserRole.LIBRARIAN]),
		],
		responses: {
			[200]: this.successResponse(
				getLoanSuccessResponse,
				"Loan returned successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request body"),
			[404]: this.errorResponse(errorResponse, "Loan not found"),
		},
	});
}

export type LoanAll = typeof LoanRoutes.prototype.allLoans;
export type MyLoans = typeof LoanRoutes.prototype.myLoans;
export type LoanCreate = typeof LoanRoutes.prototype.create;
export type LoanApprove = typeof LoanRoutes.prototype.approve;
export type LoanReject = typeof LoanRoutes.prototype.reject;
export type LoanReturn = typeof LoanRoutes.prototype.return;
