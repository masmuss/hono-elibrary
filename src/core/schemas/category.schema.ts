import { categories } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCategorySchema = createSelectSchema(categories);

export const getAllCategoriesSuccessResponse = z.object({
	data: z.array(selectCategorySchema),
	total: z.number(),
	totalPages: z.number(),
	page: z.number(),
});

export const getCategorySuccessResponse = selectCategorySchema;
