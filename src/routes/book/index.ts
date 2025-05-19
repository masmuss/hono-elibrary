import { BookHandler } from "@/core/handlers/book.handler";
import { createRouter } from "@/lib/app";
import { BookRoutes } from "./book.routes";

const routes = new BookRoutes();
const handlers = new BookHandler();

const router = createRouter()
	.openapi(routes.allBooks, handlers.getAllBooks)
	.openapi(routes.byId, handlers.getBookById)
	.openapi(routes.create, handlers.createBook)
	.openapi(routes.update, handlers.updateBook)
	.openapi(routes.softDelete, handlers.softDeleteBook)
	.openapi(routes.restore, handlers.restoreBook)
	.openapi(routes.hardDelete, handlers.hardDeleteBook);

export default router;
