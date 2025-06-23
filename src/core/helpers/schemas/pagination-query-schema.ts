import { z } from "zod";

const paginationQuerySchema = z.object({
	page: z.coerce
		.number()
		.optional()
		.openapi({
			description: "Page number for pagination",
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
			description: "Number of items per page for pagination",
			param: {
				name: "pageSize",
				in: "query",
				required: false,
			},
			example: 10,
		}),
});

export default paginationQuerySchema;
