import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { IdParamSchema, PaginationQuerySchema } from "@/core/helpers/schemas";
import {
	getAllBooksSuccessResponse,
	getBookSuccessResponse,
} from "@/core/schemas/book.schema";
import { errorResponse } from "@/core/schemas/errors.schema";
import {
	createBookSchema,
	updateBookSchema,
} from "@/core/validations/book.validation";
import { createRoute } from "@hono/zod-openapi";

export class BookRoutes extends BaseRoutes {
	allBooks = createRoute({
		tags: ["Book"],
		description: "Get all books",
		path: "/books",
		method: "get",
		request: {
			query: PaginationQuerySchema,
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
			params: IdParamSchema,
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
			body: jsonContentRequired(createBookSchema, "Create book schema"),
		},
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
			params: IdParamSchema,
			body: jsonContentRequired(updateBookSchema, "Update book schema"),
		},
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
			params: IdParamSchema,
		},
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
			params: IdParamSchema,
		},
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
			params: IdParamSchema,
		},
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
