import { z } from "zod";
import { paginationQuerySchema } from "../helpers/schemas";

export const userResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	username: z.string(),
	email: z.string().email(),
	role: z.string().nullable(),
	createdAt: z.date(),
});

export const getAllUsersSuccessResponse = z.object({
	data: z.array(userResponseSchema),
	total: z.number(),
	totalPages: z.number(),
	page: z.number(),
});

export const getAllUsersQuerySchema = paginationQuerySchema;
