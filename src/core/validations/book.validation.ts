import { books } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const createBookSchema = createInsertSchema(books, {
	title: (schema) => schema.min(3).max(255),
	isbn: (schema) => schema.min(10).max(13),
	author: (schema) => schema.min(3).max(255),
	publisher: (schema) => schema.min(3).max(255),
	pages: (schema) => schema.min(1).max(10000),
	year: (schema) => schema.min(1900).max(new Date().getFullYear()),
	stock: (schema) => schema.min(0).max(10000).default(0),
	categoryId: (schema) => schema.optional().default(1),
})
	.required({
		isbn: true,
		title: true,
		author: true,
		publisher: true,
		pages: true,
		year: true,
		stock: true,
		categoryId: true,
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const updateBookSchema = createUpdateSchema(books, {}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
