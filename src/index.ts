import createApp from "./lib/create-app";
import openAPI from "./lib/openapi";
import index from "./routes/index.route";
import book from "./routes/book";

const app = createApp();
const routes = [index, book] as const;

routes.forEach((route) => {
  app.route("/api/", route);
});

openAPI(app);

export default app;
