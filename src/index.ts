import createApp from "./lib/create-app";
import openAPI from "./lib/openapi";
import book from "./routes/book";
import index from "./routes/index.route";

const app = createApp();
const routes = [index, book] as const;

for (const route of routes) {
	app.route("/api/", route);
}

openAPI(app);

export default app;
