import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(3).max(255),
	password: z.string().min(8).max(255),
});

export const registerSchema = z.object({
	username: z.string().min(3).max(255),
	password: z.string().min(8).max(255),
	email: z.string().email(),
	name: z.string().min(3).max(255),
});

export const authHeadersSchema = z
	.object({
		Authorization: z.string(),
	})
	.required();
