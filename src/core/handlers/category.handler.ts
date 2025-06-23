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
			this.buildSuccessResponse(result, "Categories retrieved successfully"),
			200,
		);
	};

	getCategoryById: AppRouteHandler<GetCategoryById> = async (c) => {
		const { id } = c.req.valid("param");
		const result = await this.repository.byId(id);
		return c.json(
			this.buildSuccessResponse(result, "Category retrieved successfully"),
			200,
		);
	};

	createCategory: AppRouteHandler<CreateCategory> = async (c) => {
		const body = c.req.valid("json");
		const result = await this.repository.create(body);
		return c.json(
			this.buildSuccessResponse(result, "Category created successfully"),
			201,
		);
	};

	updateCategory: AppRouteHandler<UpdateCategory> = async (c) => {
		const { id } = c.req.valid("param");
		const body = c.req.valid("json");
		const result = await this.repository.update(id, body);
		return c.json(
			this.buildSuccessResponse(result, "Category updated successfully"),
			200,
		);
	};

	deleteCategory: AppRouteHandler<DeleteCategory> = async (c) => {
		const { id } = c.req.valid("param");
		await this.repository.hardDelete(id);
		return c.json(
			this.buildSuccessResponse(null, "Category deleted successfully"),
			200,
		);
	};
}
