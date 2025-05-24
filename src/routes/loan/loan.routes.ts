import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { PaginationQuerySchema, UUIDParamSchema } from "@/core/helpers/schemas";
import { errorResponse } from "@/core/schemas/errors.schema";
import {
	getAllLoansSuccessResponse,
	getLoanSuccessResponse,
} from "@/core/schemas/loan.schema";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { createLoanSchema } from "@/core/validations/loan.validation";
import { UserRole } from "@/lib/constants/roles";
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
			query: PaginationQuerySchema,
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
export type LoanCreate = typeof LoanRoutes.prototype.create;
export type LoanReturn = typeof LoanRoutes.prototype.return;
