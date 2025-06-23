import { BaseRoutes } from "@/core/base/base-routes";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { UUIDParamSchema } from "@/core/helpers/schemas";
import {
	getAllUsersQuerySchema,
	getAllUsersSuccessResponse,
	userResponseSchema,
} from "@/core/schemas/admin.user.schema";
import {
	createUserAsAdminSchema,
	updateUserAsAdminSchema,
} from "@/core/validations/admin.user.validation";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { authMiddleware } from "@/middlewares/auth";
import { authorizeRole } from "@/middlewares/authorization";
import { createRoute, z } from "@hono/zod-openapi";

export class AdminUserRoutes extends BaseRoutes {
	getAllUsers = createRoute({
		tags: ["Admin - Users Management"],
		description: "Get all users (Admin only)",
		path: "/users",
		method: "get",
		request: {
			headers: authHeadersSchema,
			query: getAllUsersQuerySchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			200: this.successResponse(
				getAllUsersSuccessResponse,
				"Users retrieved successfully",
			),
			403: this.errorResponse("Forbidden"),
			500: this.errorResponse("Internal Server Error"),
		},
	});

	createUser = createRoute({
		tags: ["Admin - Users Management"],
		description: "Create a new user, specifying a role (Admin only)",
		path: "/users",
		method: "post",
		request: {
			headers: authHeadersSchema,
			body: jsonContentRequired(createUserAsAdminSchema, "New user payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			201: this.successResponse(
				userResponseSchema.omit({ role: true, createdAt: true }),
				"User created successfully",
			),
			400: this.errorResponse("User already exists or invalid data"),
			403: this.errorResponse("Forbidden"),
		},
	});

	getUserById = createRoute({
		tags: ["Admin - Users Management"],
		description: "Get a single user by their ID (Admin only)",
		path: "/users/{id}",
		method: "get",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			200: this.successResponse(
				userResponseSchema,
				"User retrieved successfully",
			),
			403: this.errorResponse("Forbidden"),
			404: this.errorResponse("User not found"),
			500: this.errorResponse("Internal Server Error"),
		},
	});

	updateUser = createRoute({
		tags: ["Admin - Users Management"],
		description: "Update an existing user's details or role (Admin only)",
		path: "/users/{id}",
		method: "put",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
			body: jsonContentRequired(updateUserAsAdminSchema, "User update payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			200: this.successResponse(
				userResponseSchema,
				"User updated successfully",
			),
			400: this.errorResponse("Invalid data provided"),
			403: this.errorResponse("Forbidden"),
			404: this.errorResponse("User not found"),
			500: this.errorResponse("Internal Server Error"),
		},
	});

	deleteUser = createRoute({
		tags: ["Admin - Users Management"],
		description: "Soft delete a user (Admin only)",
		path: "/users/{id}",
		method: "delete",
		request: {
			headers: authHeadersSchema,
			params: UUIDParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.ADMIN])],
		responses: {
			200: this.successResponse(z.null(), "User deleted successfully"),
			403: this.errorResponse("Forbidden"),
			404: this.errorResponse("User not found"),
			500: this.errorResponse("Internal Server Error"),
		},
	});
}

export type AdminGetAllUsers = typeof AdminUserRoutes.prototype.getAllUsers;
export type AdminCreateUser = typeof AdminUserRoutes.prototype.createUser;
export type AdminGetUserById = typeof AdminUserRoutes.prototype.getUserById;
export type AdminUpdateUser = typeof AdminUserRoutes.prototype.updateUser;
export type AdminDeleteUser = typeof AdminUserRoutes.prototype.deleteUser;
