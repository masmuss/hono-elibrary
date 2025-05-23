import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import {
	authHeadersSchema,
	loginSchema,
	registerSchema,
} from "@/core/validations/auth.validation";
import { authMiddleware } from "@/middlewares/auth";
import { createRoute, z } from "@hono/zod-openapi";

export class AuthRoutes extends BaseRoutes {
	login = createRoute({
		tags: ["Auth"],
		description: "Login user",
		path: "/auth/login",
		method: "post",
		request: {
			body: jsonContentRequired(loginSchema, "Login schema"),
		},
		responses: {
			[200]: this.successResponse(
				z.object({
					data: z.any(),
				}),
				"User logged in successfully",
			),
			[401]: this.errorResponse(z.string(), "Invalid username or password"),
		},
	});

	register = createRoute({
		tags: ["Auth"],
		description: "Register user",
		path: "/auth/register",
		method: "post",
		request: {
			body: jsonContentRequired(registerSchema, "Register schema"),
		},
		responses: {
			[200]: this.successResponse(
				z.object({
					data: z.object({
						name: z.string(),
						username: z.string(),
						email: z.string(),
					}),
				}),
				"User registered successfully",
			),
		},
	});

	profile = createRoute({
		tags: ["Auth"],
		description: "Get user profile",
		path: "/auth/profile",
		method: "get",
		request: {
			headers: authHeadersSchema,
		},
		middleware: [authMiddleware],
		responses: {
			[200]: this.successResponse(
				z.any(),
				"User profile retrieved successfully",
			),
			[401]: this.errorResponse(z.string(), "Unauthorized"),
		},
	});

	logout = createRoute({
		tags: ["Auth"],
		description: "Logout user",
		path: "/auth/logout",
		method: "post",
		request: {
			headers: authHeadersSchema,
		},
		middleware: [authMiddleware],
		responses: {
			[200]: this.successResponse(z.string(), "User logged out successfully"),
			[401]: this.errorResponse(z.string(), "Unauthorized"),
		},
	});
}

export type RegisterRoute = typeof AuthRoutes.prototype.register;
export type LoginRoute = typeof AuthRoutes.prototype.login;
export type ProfileRoute = typeof AuthRoutes.prototype.profile;
export type LogoutRoute = typeof AuthRoutes.prototype.logout;
