import type { Environment } from "@/config/types";
import {
	type OpenAPIHono,
	type RouteConfig,
	type RouteHandler,
	z,
} from "@hono/zod-openapi";

export interface AppBindings {
	Bindings: Environment;
}

export type App = OpenAPIHono<AppBindings>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;
