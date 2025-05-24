import { z } from "zod";

const searchQuerySchema = z.object({
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

export default searchQuerySchema;
