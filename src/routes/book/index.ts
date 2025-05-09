import { createRouter } from "@/lib/create-app";
import { BookRoutes } from "./book.routes";
import { BookHandler } from "@/core/handlers/book.handler";

const routes = new BookRoutes()
const handlers = new BookHandler()

const router = createRouter()
    .openapi(routes.allBooks, handlers.getAllBooks)
    .openapi(routes.byId, handlers.getBookById)

export default router