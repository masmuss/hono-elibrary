import { AuthHandler } from "@/core/handlers/auth.handler";
import { createRouter } from "@/lib/app";
import { AuthRoutes } from "./auth.routes";

const routes = new AuthRoutes();
const handlers = new AuthHandler();

const router = createRouter()
	.openapi(routes.register, handlers.register)
	.openapi(routes.login, handlers.login)
	.openapi(routes.refresh, handlers.refreshToken)
	.openapi(routes.profile, handlers.profile)
	.openapi(routes.changePassword, handlers.changePassword)
	.openapi(routes.logout, handlers.logout);

export default router;
