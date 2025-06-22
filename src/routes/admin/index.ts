import { AdminUserHandler } from "@/core/handlers/admin/user.handler";
import { createRouter } from "@/lib/app";
import { AdminUserRoutes } from "./user.routes";

const routes = new AdminUserRoutes();
const handlers = new AdminUserHandler();

const router = createRouter()
	.openapi(routes.getAllUsers, handlers.getAllUsers)
	.openapi(routes.createUser, handlers.createUser)
	.openapi(routes.getUserById, handlers.getUserById)
	.openapi(routes.updateUser, handlers.updateUser)
	.openapi(routes.deleteUser, handlers.deleteUser);

export default router;
