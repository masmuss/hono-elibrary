import { z } from "zod";

export const registerSuccessResponse = z.object({
	data: z.object({
		name: z.string(),
		username: z.string(),
		email: z.string(),
	}),
});

export const loginSuccessResponse = z.object({
	data: z.object({
		id: z.string().uuid().openapi({
			description: "Unique identifier for the user",
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
		name: z.string().openapi({
			description: "Name of the user",
			example: "John Doe",
		}),
		username: z.string().openapi({
			description: "Username of the user",
			example: "johndoe",
		}),
		token: z.string().openapi({
			description: "Authentication token for the user",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
	}),
});

export const profileSuccessResponse = z.object({
	data: z.object({
		id: z.string().uuid().openapi({
			description: "Unique identifier for the user",
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
		username: z.string().openapi({
			description: "Username of the user",
			example: "johndoe",
		}),
		name: z.string().openapi({
			description: "Name of the user",
			example: "John Doe",
		}),
		role: z.enum(["ADMIN", "MEMBER", "LIBRARIAN"]).openapi({
			description: "Role of the user in the system",
			example: "MEMBER",
		}),
	}),
});
