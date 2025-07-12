import type { Environment } from "@/config/types";
import type { createDrizzle } from "@/db";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export interface AppBindings {
	Bindings: Environment;
	Variables: {
		session: any;
		user: any;
	};
}

export type App = OpenAPIHono<AppBindings>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;

declare module "hono" {
	interface ContextVariableMap {
		dbWithLogger: ReturnType<typeof createDrizzle>;
	}
}
