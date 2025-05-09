import { books } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectBooks = createSelectSchema(books);

export const getAllBooksSuccessResponse = z.object({
	data: z.array(
		selectBooks.pick({
			id: true,
			isbn: true,
			title: true,
			stock: true,
			author: true,
			createdAt: true,
		}),
	),
	total: z.number(),
	totalPages: z.number(),
	page: z.number(),
	message: z.string(),
	error: z.nullable(z.string()),
});

export const getBookByIdSuccessResponse = z.object({
	data: selectBooks,
	message: z.string(),
	error: z.nullable(z.string()),
});
