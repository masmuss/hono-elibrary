import { AppRouteHandler } from "@/lib/types";
import { BaseHandler } from "../base/base-handler";
import { BookRepository } from "../repositories/book.repository";
import { AllBooksRoute, BookByIdRoute } from "@/routes/book/book.routes";

export class BookHandler extends BaseHandler {
    constructor() {
        super(new BookRepository());
    }

    getAllBooks: AppRouteHandler<AllBooksRoute> = async (c) => {
        try {
            const filter = c.req.valid("query");

            const books = await this.repository.get(filter);
            return c.json(this.responseBuilder(books, "Books retrieved successfully"));
        } catch (error: unknown | any) {
            return c.json(this.responseBuilder(null, "Failed to retrieve books", error));
        }
    }

    getBookById: AppRouteHandler<BookByIdRoute> = async (c) => {
        try {
            const { id } = c.req.valid("param");

            const book = await this.repository.byId(id);

            if (!book) {
                return c.json(this.responseBuilder(null, "Book not found"), 404);
            }

            return c.json(this.responseBuilder(book, "Book retrieved successfully"));
        } catch (error: unknown | any) {
            return c.json(this.responseBuilder(null, "Failed to retrieve book", error));
        }
    }
}