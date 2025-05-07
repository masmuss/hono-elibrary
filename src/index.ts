import createApp from "./lib/create-app";
import index from "./routes/index.route";

const app = createApp();
const routes = [index] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
