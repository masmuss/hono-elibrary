import { parseEnv } from "@/config/env";
import defaultHook from "@/core/helpers/hooks/default-hook";
import type { AppBindings } from "@/lib/types";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: true,
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();
	app.use((c, next) => {
		c.env = parseEnv(process.env);
		return next();
	});

	app.use(requestId());
	app.onError(onError);
	app.notFound(notFound);
	return app;
}
