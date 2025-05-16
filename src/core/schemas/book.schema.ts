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
});

export const getBookSuccessResponse = z.object({
	data: selectBooks,
});
