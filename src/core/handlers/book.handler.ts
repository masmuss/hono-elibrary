import type { AppRouteHandler } from "@/lib/types";
import type { AllBooksRoute, BookByIdRoute } from "@/routes/book/book.routes";
import { BaseHandler } from "../base/base-handler";
import { ResponseData } from "../base/types";
import { BookRepository } from "../repositories/book.repository";

export class BookHandler extends BaseHandler {
	constructor() {
		super(new BookRepository());
	}

	getAllBooks: AppRouteHandler<AllBooksRoute> = async (c) => {
		try {
			const filter = c.req.valid("query");

			const books = await this.repository.get(filter);
			return c.json(
				this.responseBuilder(books, "Books retrieved successfully"),
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to retrieve books", error as Error),
			);
		}
	};

	getBookById: AppRouteHandler<BookByIdRoute> = async (c) => {
		try {
			const { id } = c.req.valid("param");

			if (!id)
				return c.json(this.responseBuilder(null, "Book ID is required"), 400);

			const book = await this.repository.byId(id);

			if (!book)
				return c.json(this.responseBuilder(null, "Book not found"), 404);

			return c.json(this.responseBuilder(book, "Book retrieved successfully"));
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to retrieve book", error as Error),
			);
		}
	};
}
