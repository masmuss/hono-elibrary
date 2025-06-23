import { z } from "zod";

export const categorySchema = z.object({
	name: z
		.string()
		.min(3, { message: "Category name must be at least 3 characters long" })
		.openapi({
			description: "Name of the category",
			example: "Fiksi Ilmiah",
		}),
});
