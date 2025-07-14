import { AdminUserHandler } from "@/core/handlers/admin/user.handler";
import { createRouter } from "@/lib/app";
import { AdminUserRoutes } from "./user.routes";
import { AdminLogRoutes } from "./log.routes";
import { AdminLogHandler } from "@/core/handlers/admin/log.handler";

const routes = new AdminUserRoutes();
const handlers = new AdminUserHandler();

const logRoutes = new AdminLogRoutes();
const logHandlers = new AdminLogHandler();

const router = createRouter()
	.openapi(routes.getAllUsers, handlers.getAllUsers)
	.openapi(routes.createUser, handlers.createUser)
	.openapi(routes.getUserById, handlers.getUserById)
	.openapi(routes.updateUser, handlers.updateUser)
	.openapi(routes.deleteUser, handlers.deleteUser);

router.openapi(logRoutes.getAuditLogs, logHandlers.getLogs);

export default router;
