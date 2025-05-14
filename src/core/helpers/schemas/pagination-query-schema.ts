import { z } from "zod";

const PaginationQuerySchema = z.object({
	page: z.coerce
		.number()
		.optional()
		.openapi({
			param: {
				name: "page",
				in: "query",
				required: false,
			},
			example: 1,
		}),
	pageSize: z.coerce
		.number()
		.optional()
		.openapi({
			param: {
				name: "pageSize",
				in: "query",
				required: false,
			},
			example: 10,
		}),
	orderBy: z
		.string()
		.optional()
		.openapi({
			param: {
				name: "orderBy",
				in: "query",
				required: false,
			},
			example: "createdAt",
		}),
	search: z
		.string()
		.optional()
		.openapi({
			param: {
				name: "search",
				in: "query",
				description: "Search books by title, author, isbn, or publisher",
				required: false,
			},
			example: "search term",
		}),
});

export default PaginationQuerySchema;
