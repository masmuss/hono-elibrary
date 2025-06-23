import { MemberHandler } from "@/core/handlers/member.handler";
import { createRouter } from "@/lib/app";
import { MemberRoutes } from "./member.routes";

const routes = new MemberRoutes();
const handlers = new MemberHandler();

const router = createRouter()
	.openapi(routes.getProfile, handlers.getProfile)
	.openapi(routes.updateProfile, handlers.updateProfile);

export default router;
