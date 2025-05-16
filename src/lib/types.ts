import type { Environment } from "@/config/types";
import type { books } from "@/db/schema";
import {
	type OpenAPIHono,
	type RouteConfig,
	type RouteHandler,
	z,
} from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";

export interface AppBindings {
	Bindings: Environment;
}

export type App = OpenAPIHono<AppBindings>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;

export type Book = InferSelectModel<typeof books>;
