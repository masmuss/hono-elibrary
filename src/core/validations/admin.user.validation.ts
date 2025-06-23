import { z } from "zod";
import { registerSchema } from "./auth.validation";

export const createUserAsAdminSchema = registerSchema.extend({
	roleId: z.number().int().positive().openapi({
		description:
			"ID for the user's role (1: ADMIN, 2: MEMBER, 3: LIBRARIAN - check your DB)",
		example: 2,
	}),
});

export const updateUserAsAdminSchema = registerSchema
	.extend({
		roleId: z.number().int().positive().optional().openapi({
			description: "New ID for the user's role",
			example: 3,
		}),
	})
	.partial();
