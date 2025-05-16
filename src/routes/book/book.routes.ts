import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { IdParamSchema, PaginationQuerySchema } from "@/core/helpers/schemas";
import {
	getAllBooksSuccessResponse,
	getBookByIdSuccessResponse,
	getBookSuccessResponse,
} from "@/core/schemas/book.schema";
import { createBookSchema } from "@/core/validations/book.validation";
import { createRoute, z } from "@hono/zod-openapi";

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
			[400]: this.errorResponse(
				z.object({
					message: z.string(),
				}),
				"Book ID is required",
			),
			[404]: this.errorResponse(
				z.object({
					message: z.string(),
				}),
				"Book not found",
			),
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
			[400]: this.errorResponse(
				z.object({
					message: z.string(),
				}),
				"Invalid request",
			),
		},
	});
}

export type AllBooksRoute = typeof BookRoutes.prototype.allBooks;
export type BookByIdRoute = typeof BookRoutes.prototype.byId;
export type CreateBookRoute = typeof BookRoutes.prototype.create;
