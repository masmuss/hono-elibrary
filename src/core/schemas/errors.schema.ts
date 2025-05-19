import { z } from "zod";

export const errorResponse = z.object({
	message: z.string(),
});
