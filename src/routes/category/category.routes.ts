import { BaseRoutes } from "@/core/base/base-routes";
import { idParamSchema, paginationQuerySchema } from "@/core/helpers/schemas";
import jsonContentRequired from "@/core/helpers/json-content-required";
import { categorySchema } from "@/core/validations/category.validation";
import { createRoute } from "@hono/zod-openapi";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { authMiddleware } from "@/middlewares/auth";
import { authorizeRole } from "@/middlewares/authorization";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { errorResponse } from "@/core/schemas/errors.schema";
import {
	getAllCategoriesSuccessResponse,
	getCategorySuccessResponse,
} from "@/core/schemas/category.schema";
import { z } from "zod";

export class CategoryRoutes extends BaseRoutes {
	getAll = createRoute({
		tags: ["Category"],
		description: "Get all categories",
		path: "/categories",
		method: "get",
		request: { query: paginationQuerySchema },
		responses: {
			200: this.successResponse(getAllCategoriesSuccessResponse, "OK"),
		},
	});

	getById = createRoute({
		tags: ["Category"],
		description: "Get category by ID",
		path: "/categories/{id}",
		method: "get",
		request: { params: idParamSchema },
		responses: {
			200: this.successResponse(getCategorySuccessResponse, "OK"),
			404: this.errorResponse(errorResponse, "Not Found"),
		},
	});

	create = createRoute({
		tags: ["Category"],
		description: "Create a new category",
		path: "/categories",
		method: "post",
		request: {
			headers: authHeadersSchema,
			body: jsonContentRequired(categorySchema, "Create category payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.LIBRARIAN])],
		responses: {
			201: this.successResponse(getCategorySuccessResponse, "Created"),
			400: this.errorResponse(
				errorResponse,
				"Bad Request (e.g., validation error)",
			),
			403: this.errorResponse(errorResponse, "Forbidden"),
		},
	});

	update = createRoute({
		tags: ["Category"],
		description: "Update a category",
		path: "/categories/{id}",
		method: "put",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
			body: jsonContentRequired(categorySchema, "Update category payload"),
		},
		middleware: [authMiddleware, authorizeRole([UserRole.LIBRARIAN])],
		responses: {
			200: this.successResponse(getCategorySuccessResponse, "OK"),
			403: this.errorResponse(errorResponse, "Forbidden"),
			400: this.errorResponse(
				errorResponse,
				"Bad Request (e.g., validation error)",
			),
			404: this.errorResponse(errorResponse, "Not Found"),
		},
	});

	delete = createRoute({
		tags: ["Category"],
		description: "Delete a category",
		path: "/categories/{id}",
		method: "delete",
		request: {
			headers: authHeadersSchema,
			params: idParamSchema,
		},
		middleware: [authMiddleware, authorizeRole([UserRole.LIBRARIAN])],
		responses: {
			200: this.successResponse(z.null(), "Deleted"),
			400: this.errorResponse(
				errorResponse,
				"Bad Request (e.g., category in use)",
			),
			500: this.errorResponse(errorResponse, "Internal Server Error"),
			403: this.errorResponse(errorResponse, "Forbidden"),
			404: this.errorResponse(errorResponse, "Not Found"),
		},
	});
}

export type GetAllCategories = typeof CategoryRoutes.prototype.getAll;
export type GetCategoryById = typeof CategoryRoutes.prototype.getById;
export type CreateCategory = typeof CategoryRoutes.prototype.create;
export type UpdateCategory = typeof CategoryRoutes.prototype.update;
export type DeleteCategory = typeof CategoryRoutes.prototype.delete;
