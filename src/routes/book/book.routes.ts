import { BaseRoutes } from "@/core/base/base-routes";
import { IdParamSchema, PaginationQuerySchema } from "@/core/helpers/schemas";
import {
	getAllBooksSuccessResponse,
	getBookByIdSuccessResponse,
} from "@/core/schemas/book.schema";
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
				getBookByIdSuccessResponse,
				"Book retrieved successfully",
			),
			[404]: this.errorResponse(
				z.object({
					message: z.string(),
				}),
				"Book not found",
			),
		},
	});
}

export type AllBooksRoute = typeof BookRoutes.prototype.allBooks;
export type BookByIdRoute = typeof BookRoutes.prototype.byId;
