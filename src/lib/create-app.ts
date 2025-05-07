import { Hono } from "hono";
import { requestId } from "hono/request-id";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { parseEnv } from "@/env";
import { AppBindings } from "@/lib/types";

export function createRouter() {
  return new Hono<AppBindings>({
    strict: false,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use((c, next) => {
    c.env = parseEnv(Object.assign(c.env, process.env));
    return next();
  });

  app.use(requestId());
  app.onError(onError);
  app.notFound(notFound);
  return app;
}
