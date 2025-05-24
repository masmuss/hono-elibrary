import { z } from "zod";

export const getAllLoansParamsSchema = z.object({
	memberId: z.string().optional(),
});

export const createLoanSchema = z.object({
	memberId: z.string().uuid(),
	bookId: z.number().int(),
	returnDate: z.string().datetime(),
});
