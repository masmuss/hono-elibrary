import { loans } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectLoan = createSelectSchema(loans);

export const getAllLoansSuccessResponse = z.object({
	data: z.array(selectLoan),
	total: z.number(),
	totalPages: z.number(),
	page: z.number(),
});

export const getLoanSuccessResponse = z.object({
	data: selectLoan,
});
