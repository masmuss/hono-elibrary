import { z } from "zod";

export const getAllLoansParamsSchema = z.object({
	memberId: z.string().optional().openapi({
		description: "Unique identifier for the member",
		example: "123e4567-e89b-12d3-a456-426614174000",
	}),
});

export const createLoanSchema = z.object({
	memberId: z.string().uuid().openapi({
		description: "Unique identifier for the member",
		example: "123e4567-e89b-12d3-a456-426614174000",
	}),
	bookId: z.number().int().openapi({
		description: "Unique identifier for the book",
		example: 10,
	}),
});
