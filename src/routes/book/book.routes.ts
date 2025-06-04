import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { idParamSchema } from "@/core/helpers/schemas";
import {
	getAllBooksQuerySchema,
	getAllBooksSuccessResponse,
	getBookSuccessResponse,
} from "@/core/schemas/book.schema";
import { errorResponse } from "@/core/schemas/errors.schema";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import {
	createBookSchema,
	updateBookSchema,
} from "@/core/validations/book.validation";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { authMiddleware } from "@/middlewares/auth";
import { authorizeRole } from "@/middlewares/authorization";
import { createRoute } from "@hono/zod-openapi";

export class BookRoutes extends BaseRoutes {
	allBooks = createRoute({
		tags: ["Book"],
		description: "Get all books",
		path: "/books",
		method: "get",
		request: {
			query: getAllBooksQuerySchema,
		},
		responses: {
			[200]: this.successResponse(
				getAllBooksSuccessResponse,
				"Books retrieved successfully",
			),
		},
	});

	byId = createRoute({
		tags: ["Book"],
		description: "Get book by id",
		path: "/books/{id}",
		method: "get",
		request: {
			params: idParamSchema,
		},
		responses: {
			[200]: this.successResponse(
				getBookSuccessResponse,
				"Book retrieved successfully",
			),
			[400]: this.errorResponse(errorResponse, "Book ID is required"),
			[404]: this.errorResponse(errorResponse, "Book not found"),
		},
	});

	create = createRoute({
		tags: ["Book"],
		description: "Create a new book",
		path: "/books",
		method: "post",
		request: {
			headers: authHeadersSchema,
			body: jsonContentRequired(createBookSchema, "Create book schema payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			[201]: this.successResponse(
				getBookSuccessResponse,
				"Book created successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request"),
		},
	});

	update = createRoute({
		tags: ["Book"],
		description: "Update a book",
		path: "/books/{id}",
		method: "put",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
			body: jsonContentRequired(updateBookSchema, "Update book schema payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			[200]: this.successResponse(
				getBookSuccessResponse,
				"Book updated successfully",
			),
			[400]: this.errorResponse(errorResponse, "Invalid request"),
			[404]: this.errorResponse(errorResponse, "Book not found"),
		},
	});

	softDelete = createRoute({
		tags: ["Book"],
		description: "Soft delete a book",
		path: "/books/{id}",
		method: "delete",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			[200]: this.successResponse(errorResponse, "Book deleted successfully"),
			[400]: this.errorResponse(errorResponse, "Book ID is required"),
			[404]: this.errorResponse(errorResponse, "Book not found"),
		},
	});

	restore = createRoute({
		tags: ["Book"],
		description: "Restore a soft deleted book",
		path: "/books/{id}/restore",
		method: "post",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			[200]: this.successResponse(errorResponse, "Book restored successfully"),
			[400]: this.errorResponse(errorResponse, "Book ID is required"),
			[404]: this.errorResponse(errorResponse, "Book not found"),
		},
	});

	hardDelete = createRoute({
		tags: ["Book"],
		description: "Hard delete a book",
		path: "/books/{id}/hard-delete",
		method: "delete",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			[200]: this.successResponse(
				errorResponse,
				"Book hard deleted successfully",
			),
			[400]: this.errorResponse(errorResponse, "Book ID is required"),
			[404]: this.errorResponse(errorResponse, "Book not found"),
		},
	});
}

export type AllBooksRoute = typeof BookRoutes.prototype.allBooks;
export type BookByIdRoute = typeof BookRoutes.prototype.byId;
export type CreateBookRoute = typeof BookRoutes.prototype.create;
export type UpdateBookRoute = typeof BookRoutes.prototype.update;
export type SoftDeleteBookRoute = typeof BookRoutes.prototype.softDelete;
export type RestoreBookRoute = typeof BookRoutes.prototype.restore;
export type HardDeleteBookRoute = typeof BookRoutes.prototype.hardDelete;
