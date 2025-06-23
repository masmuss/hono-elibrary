import createApp from "./lib/app";
import openAPI from "./lib/openapi";
import index from "./routes";
import admin from "./routes/admin";
import auth from "./routes/auth";
import book from "./routes/book";
import category from "./routes/category";
import loan from "./routes/loan";

const app = createApp();
const routes = [index, auth, category, book, loan] as const;

for (const route of routes) {
	app.route("/api/", route);
}

app.route("/api/admin", admin);

openAPI(app);

export default app;
