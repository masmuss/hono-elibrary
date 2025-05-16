import { BookHandler } from "@/core/handlers/book.handler";
import { createRouter } from "@/lib/app";
import { BookRoutes } from "./book.routes";

const routes = new BookRoutes();
const handlers = new BookHandler();

const router = createRouter()
	.openapi(routes.allBooks, handlers.getAllBooks)
	.openapi(routes.byId, handlers.getBookById)
	.openapi(routes.create, handlers.createBook);

export default router;
