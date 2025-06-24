import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import {
	loginSuccessResponse,
	profileSuccessResponse,
	registerSuccessResponse,
} from "@/core/schemas/auth.schema";
import {
	authHeadersSchema,
	changePasswordSchema,
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
			200: this.successResponse(loginSuccessResponse, "Login successful"),
			401: this.errorResponse("Invalid credentials"),
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
			201: this.successResponse(
				registerSuccessResponse,
				"User registered successfully",
			),
			400: this.errorResponse("Bad Request (e.g., user already exists)"),
			422: this.errorResponse("Validation Error"),
		},
	});

	refresh = createRoute({
		tags: ["Auth"],
		description: "Get a new access token using a refresh token",
		path: "/auth/refresh",
		method: "post",
		responses: {
			200: this.successResponse(
				loginSuccessResponse,
				"Token refreshed successfully",
			),
			401: this.errorResponse("Unauthorized"),
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
			200: this.successResponse(
				profileSuccessResponse,
				"User profile retrieved successfully",
			),
			401: this.errorResponse("Unauthorized"),
		},
	});

	changePassword = createRoute({
		tags: ["Auth"],
		description: "Change password for the currently logged-in user",
		path: "/auth/change-password",
		method: "put",
		request: {
			headers: authHeadersSchema,
			body: jsonContentRequired(
				changePasswordSchema,
				"Change password payload",
			),
		},
		middleware: [authMiddleware],
		responses: {
			200: this.successResponse(z.null(), "Password updated successfully"),
			400: this.errorResponse("Bad Request (e.g., incorrect current password)"),
			401: this.errorResponse("Unauthorized"),
			422: this.errorResponse("Validation Error"),
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
			200: this.successResponse(z.null(), "User logged out successfully"),
			401: this.errorResponse("Unauthorized"),
		},
	});
}

export type RegisterRoute = typeof AuthRoutes.prototype.register;
export type LoginRoute = typeof AuthRoutes.prototype.login;
export type RefreshTokenRoute = typeof AuthRoutes.prototype.refresh;
export type ProfileRoute = typeof AuthRoutes.prototype.profile;
export type ChangePasswordRoute = typeof AuthRoutes.prototype.changePassword;
export type LogoutRoute = typeof AuthRoutes.prototype.logout;
