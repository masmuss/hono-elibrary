import { books } from "@/db/schema";
import type { Environment } from "@/env";
import { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import { InferSelectModel } from "drizzle-orm";

export interface AppBindings {
  Bindings: Environment;
  Variables: {
    user: any;
    session: any;
  };
}

export type App = OpenAPIHono<AppBindings>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Book = InferSelectModel<typeof books>;