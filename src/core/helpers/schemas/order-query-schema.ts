import { z } from "zod";

const orderQuerySchema = z.object({
	orderBy: z
		.string()
		.optional()
		.openapi({
			description: "Field to order the results by",
			param: {
				name: "orderBy",
				in: "query",
				required: false,
			},
			example: "createdAt",
		}),
});

export default orderQuerySchema;
