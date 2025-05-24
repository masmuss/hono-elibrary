import { loans } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectLoan = createSelectSchema(loans);

export const loanSchema = z.object({
	id: z.string().uuid().openapi({
		description: "Unique identifier for the loan",
		example: "123e4567-e89b-12d3-a456-426614174000",
	}),
	loanDate: z.string().date().openapi({
		description: "Date when the loan was created",
		example: "2023-10-01",
	}),
	returnDate: z.string().date().openapi({
		description: "Date when the loan is due to be returned",
		example: "2023-10-15",
	}),
	returnedAt: z.string().date().nullable().openapi({
		description: "Date when the loan was returned, if applicable",
		example: "2023-10-10",
	}),
	book: z
		.object({
			title: z.string().openapi({
				description: "Title of the book",
				example: "The Great Gatsby",
			}),
			isbn: z.string().openapi({
				description: "ISBN of the book",
				example: "9780743273565",
			}),
			author: z.string().openapi({
				description: "Author of the book",
				example: "F. Scott Fitzgerald",
			}),
			publisher: z.string().openapi({
				description: "Publisher of the book",
				example: "Scribner",
			}),
		})
		.openapi({
			description: "Details of the book associated with the loan",
		}),
	member: z
		.object({
			user: z
				.object({
					name: z.string().openapi({
						description: "Name of the member",
						example: "John Doe",
					}),
				})
				.openapi({
					description: "Details of the user associated with the member",
				}),
		})
		.openapi({
			description: "Details of the member who took the loan",
		}),
});

export const getAllLoansSuccessResponse = z.object({
	data: z.array(loanSchema),
});

export const getLoanSuccessResponse = z.object({
	data: loanSchema,
});
