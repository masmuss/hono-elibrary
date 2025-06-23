import { BaseHandler } from "../base/base-handler";
import { CategoryRepository } from "../repositories/category.repository";
import type { AppRouteHandler } from "@/lib/types";
import type {
	CreateCategory,
	DeleteCategory,
	GetAllCategories,
	GetCategoryById,
	UpdateCategory,
} from "@/routes/category/category.routes";

export class CategoryHandler extends BaseHandler {
	constructor() {
		super(new CategoryRepository());
	}

	getAllCategories: AppRouteHandler<GetAllCategories> = async (c) => {
		const filter = c.req.valid("query");
		const result = await this.repository.get(filter);
		return c.json(
			this.responseBuilder(result, "Categories retrieved successfully"),
		);
	};

	getCategoryById: AppRouteHandler<GetCategoryById> = async (c) => {
		const { id } = c.req.valid("param");
		const result = await this.repository.byId(id);
		if (!result) {
			return c.json(this.responseBuilder(null, "Category not found"), 404);
		}
		return c.json(
			this.responseBuilder(result, "Category retrieved successfully"),
		);
	};

	createCategory: AppRouteHandler<CreateCategory> = async (c) => {
		try {
			const body = c.req.valid("json");
			const result = await this.repository.create(body);
			return c.json(
				this.responseBuilder(result, "Category created successfully"),
				201,
			);
		} catch (error) {
			return c.json(
				this.responseBuilder(null, "Failed to create category", error as Error),
				400,
			);
		}
	};

	updateCategory: AppRouteHandler<UpdateCategory> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await this.repository.update(id, body);
			if (!result) {
				return c.json(this.responseBuilder(null, "Category not found"), 404);
			}
			return c.json(
				this.responseBuilder(result, "Category updated successfully"),
				200,
			);
		} catch (error) {
			return c.json(
				this.responseBuilder(null, "Failed to update category", error as Error),
				400,
			);
		}
	};

	deleteCategory: AppRouteHandler<DeleteCategory> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const result = await this.repository.hardDelete(id);
			if (!result) {
				return c.json(this.responseBuilder(null, "Category not found"), 404);
			}
			return c.json(
				this.responseBuilder(null, "Category deleted successfully"),
				200,
			);
		} catch (error) {
			if ((error as Error).message.includes("in use")) {
				return c.json(
					this.responseBuilder(null, (error as Error).message, error as Error),
					400,
				);
			}
			return c.json(
				this.responseBuilder(null, "Failed to delete category", error as Error),
				500,
			);
		}
	};
}
