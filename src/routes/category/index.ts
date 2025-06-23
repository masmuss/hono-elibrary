import { CategoryHandler } from "@/core/handlers/category.handler";
import { createRouter } from "@/lib/app";
import { CategoryRoutes } from "./category.routes";

const routes = new CategoryRoutes();
const handlers = new CategoryHandler();

const router = createRouter()
	.openapi(routes.getAll, handlers.getAllCategories)
	.openapi(routes.getById, handlers.getCategoryById)
	.openapi(routes.create, handlers.createCategory)
	.openapi(routes.update, handlers.updateCategory)
	.openapi(routes.delete, handlers.deleteCategory);

export default router;
