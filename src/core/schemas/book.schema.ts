import { books } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectBook = createSelectSchema(books);

export const getAllBooksSuccessResponse = z.object({
	data: z.array(
		selectBook.pick({
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
	data: selectBook,
});
