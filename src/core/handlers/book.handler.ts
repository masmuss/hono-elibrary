import type { AppRouteHandler } from "@/lib/types";
import type {
	AllBooksRoute,
	BookByIdRoute,
	CreateBookRoute,
	RestoreBookRoute,
	SoftDeleteBookRoute,
	UpdateBookRoute,
} from "@/routes/book/book.routes";
import { BaseHandler } from "../base/base-handler";
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

	createBook: AppRouteHandler<CreateBookRoute> = async (c) => {
		try {
			const body = c.req.valid("json");

			if (!body) {
				throw new Error("Invalid request body");
			}

			const book = await this.repository.create(body);

			if (!book) {
				throw new Error("Failed to create book");
			}

			return c.json(
				this.responseBuilder(book, "Book created successfully"),
				201,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to create book", error as Error),
				400,
			);
		}
	};

	updateBook: AppRouteHandler<UpdateBookRoute> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			if (!id) {
				return c.json(this.responseBuilder(null, "Book ID is required"), 400);
			}

			if (!body) {
				return c.json(this.responseBuilder(null, "Invalid request body"), 400);
			}

			const book = await this.repository.update(id, body);

			if (!book) {
				return c.json(this.responseBuilder(null, "Book not found"), 404);
			}

			return c.json(
				this.responseBuilder(book, "Book updated successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to update book", error as Error),
				400,
			);
		}
	};

	softDeleteBook: AppRouteHandler<SoftDeleteBookRoute> = async (c) => {
		try {
			const { id } = c.req.valid("param");

			if (!id) {
				return c.json(this.responseBuilder(null, "Book ID is required"), 400);
			}

			const book = await this.repository.softDelete(id);

			if (!book) {
				return c.json(this.responseBuilder(null, "Book not found"), 404);
			}

			return c.json(
				this.responseBuilder(book, "Book deleted successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to delete book", error as Error),
				400,
			);
		}
	};

	restoreBook: AppRouteHandler<RestoreBookRoute> = async (c) => {
		try {
			const { id } = c.req.valid("param");

			if (!id) {
				return c.json(this.responseBuilder(null, "Book ID is required"), 400);
			}

			const book = await this.repository.restore(id);

			if (!book) {
				return c.json(this.responseBuilder(null, "Book not found"), 404);
			}

			return c.json(
				this.responseBuilder(book, "Book restored successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to restore book", error as Error),
				400,
			);
		}
	};

	hardDeleteBook: AppRouteHandler<RestoreBookRoute> = async (c) => {
		try {
			const { id } = c.req.valid("param");

			if (!id) {
				return c.json(this.responseBuilder(null, "Book ID is required"), 400);
			}

			const book = await this.repository.hardDelete(id);

			if (!book) {
				return c.json(this.responseBuilder(null, "Book not found"), 404);
			}

			return c.json(
				this.responseBuilder(book, "Book deleted successfully"),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to delete book", error as Error),
				400,
			);
		}
	};
}
