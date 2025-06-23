import type { AppRouteHandler } from "@/lib/types";
import type {
	AllBooksRoute,
	BookByIdRoute,
	CreateBookRoute,
	HardDeleteBookRoute,
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
		const filter = c.req.valid("query");
		const books = await this.repository.get(filter);
		return c.json(
			this.buildSuccessResponse(books, "Books retrieved successfully"),
		);
	};

	getBookById: AppRouteHandler<BookByIdRoute> = async (c) => {
		const { id } = c.req.valid("param");
		const book = await this.repository.byId(id);
		return c.json(
			this.buildSuccessResponse(book, "Book retrieved successfully"),
			200,
		);
	};

	createBook: AppRouteHandler<CreateBookRoute> = async (c) => {
		const body = c.req.valid("json");
		const book = await this.repository.create(body);
		return c.json(
			this.buildSuccessResponse(book, "Book created successfully"),
			201,
		);
	};

	updateBook: AppRouteHandler<UpdateBookRoute> = async (c) => {
		const { id } = c.req.valid("param");
		const body = c.req.valid("json");
		const book = await this.repository.update(id, body);
		return c.json(
			this.buildSuccessResponse(book, "Book updated successfully"),
			200,
		);
	};

	softDeleteBook: AppRouteHandler<SoftDeleteBookRoute> = async (c) => {
		const { id } = c.req.valid("param");
		await this.repository.softDelete(id);
		return c.json(
			this.buildSuccessResponse(null, "Book deleted successfully"),
			200,
		);
	};

	restoreBook: AppRouteHandler<RestoreBookRoute> = async (c) => {
		const { id } = c.req.valid("param");
		const book = await this.repository.restore(id);
		return c.json(
			this.buildSuccessResponse(book, "Book restored successfully"),
			200,
		);
	};

	hardDeleteBook: AppRouteHandler<HardDeleteBookRoute> = async (c) => {
		const { id } = c.req.valid("param");
		await this.repository.hardDelete(id);
		return c.json(
			this.buildSuccessResponse(null, "Book permanently deleted"),
			200,
		);
	};
}
