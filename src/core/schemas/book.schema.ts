import { books } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
	orderQuerySchema,
	paginationQuerySchema,
	searchQuerySchema,
} from "../helpers/schemas";

export const selectBook = createSelectSchema(books).openapi({
	description: "Schema for selecting book data",
});

export const getAllBooksQuerySchema = z.object({
	...paginationQuerySchema.shape,
	...searchQuerySchema.shape,
	...orderQuerySchema.shape,
});

export const getAllBooksSuccessResponse = z.object({
	data: z.array(
		selectBook.pick({
			id: true,
			isbn: true,
			title: true,
			availableCopies: true,
			author: true,
			createdAt: true,
		}),
	),
	total: z.number(),
	totalPages: z.number(),
	page: z.number(),
});

export const getBookSuccessResponse = z.object({
	data: selectBook,
});
