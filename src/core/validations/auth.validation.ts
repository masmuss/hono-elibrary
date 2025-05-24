import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(3).max(255).openapi({
		description: "Username for login",
		example: "john_doe",
	}),
	password: z.string().min(8).max(255).openapi({
		description: "Password for login",
		example: "securePassword123",
	}),
});

export const registerSchema = z.object({
	username: z.string().min(3).max(255).openapi({
		description: "Username for registration",
		example: "jane_doe",
	}),
	password: z.string().min(8).max(255).openapi({
		description: "Password for registration",
		example: "securePassword123",
	}),
	email: z.string().email().openapi({
		description: "Email address for registration",
		example: "johndoe@exmple.com",
	}),
	name: z.string().min(3).max(255).openapi({
		description: "Full name of the user",
		example: "John Doe",
	}),
});

export const authHeadersSchema = z
	.object({
		Authorization: z.string().openapi({
			description: "Token for authentication",
			example: "your_jwt_token_here",
			param: {
				name: "Authorization",
				in: "header",
				required: true,
			},
		}),
	})
	.required();
