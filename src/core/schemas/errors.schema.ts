import { z } from "zod";

export const errorResponse = z.object({
	message: z.string().openapi({
		description: "Error message describing the issue",
		example: "Resource not found",
	}),
});
