import createApp from "./lib/app";
import openAPI from "./lib/openapi";
import index from "./routes";
import auth from "./routes/auth";
import book from "./routes/book";

const app = createApp();
const routes = [index, auth, book] as const;

for (const route of routes) {
	app.route("/api/", route);
}

openAPI(app);

export default app;
