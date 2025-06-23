import { books } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const createBookSchema = createInsertSchema(books, {
	title: (schema) =>
		schema.min(3).max(255).openapi({
			description: "Title of the book",
			example: "The Great Gatsby",
		}),
	synopsis: (schema) =>
		schema.min(10).max(1000).optional().openapi({
			description: "Synopsis of the book",
			example:
				"A novel set in the 1920s that explores themes of decadence, idealism, resistance to change, social upheaval, and excess.",
		}),
	isbn: (schema) =>
		schema.min(10).max(13).openapi({
			description: "ISBN of the book",
			example: "9780743273565",
		}),
	author: (schema) =>
		schema.min(3).max(255).openapi({
			description: "Author of the book",
			example: "F. Scott Fitzgerald",
		}),
	publisher: (schema) =>
		schema.min(3).max(255).openapi({
			description: "Publisher of the book",
			example: "Scribner",
		}),
	pages: (schema) =>
		schema.min(1).max(10000).openapi({
			description: "Number of pages in the book",
			example: 180,
		}),
	year: (schema) =>
		schema.min(1900).max(new Date().getFullYear()).openapi({
			description: "Publication year of the book",
			example: 1925,
		}),
	stock: (schema) =>
		schema.min(0).max(10000).default(0).openapi({
			description: "Number of copies available in stock",
			example: 5,
		}),
	categoryId: (schema) =>
		schema.optional().default(1).openapi({
			description: "ID of the category the book belongs to",
			example: 1,
		}),
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

export const updateBookSchema = createUpdateSchema(books, {
	title: (schema) =>
		schema.min(3).max(255).optional().openapi({
			description: "Title of the book",
			example: "The Great Gatsby",
		}),
	synopsis: (schema) =>
		schema.min(10).max(1000).optional().openapi({
			description: "Synopsis of the book",
			example:
				"A novel set in the 1920s that explores themes of decadence, idealism, resistance to change, social upheaval, and excess.",
		}),
	isbn: (schema) =>
		schema.min(10).max(13).optional().openapi({
			description: "ISBN of the book",
			example: "9780743273565",
		}),
	author: (schema) =>
		schema.min(3).max(255).optional().openapi({
			description: "Author of the book",
			example: "F. Scott Fitzgerald",
		}),
	publisher: (schema) =>
		schema.min(3).max(255).optional().openapi({
			description: "Publisher of the book",
			example: "Scribner",
		}),
	pages: (schema) =>
		schema.min(1).max(10000).optional().openapi({
			description: "Number of pages in the book",
			example: 180,
		}),
	year: (schema) =>
		schema.min(1900).max(new Date().getFullYear()).optional().openapi({
			description: "Publication year of the book",
			example: 1925,
		}),
	stock: (schema) =>
		schema.min(0).max(10000).default(0).optional().openapi({
			description: "Number of copies available in stock",
			example: 5,
		}),
	categoryId: (schema) =>
		schema.optional().default(1).optional().openapi({
			description: "ID of the category the book belongs to",
			example: 1,
		}),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
