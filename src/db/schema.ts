import { relations } from "drizzle-orm";
import {
	date,
	integer,
	pgTable,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import timestamps from "./timestamps";

export const categories = pgTable("categories", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: varchar("name", { length: 100 }).notNull(),
	...timestamps,
});

export const books = pgTable("books", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	isbn: varchar("isbn", { length: 255 }).unique().notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	synopsis: text("synopsis"),
	author: varchar("author", { length: 255 }),
	publisher: varchar("publisher", { length: 255 }),
	pages: integer("pages").notNull(),
	year: integer("year").notNull(),
	stock: integer("stock").default(0),
	categoryId: integer("category_id")
		.references(() => categories.id)
		.notNull(),
	...timestamps,
});

export const bookRelations = relations(books, ({ one }) => ({
	category: one(categories, {
		fields: [books.categoryId],
		references: [categories.id],
	}),
}));

export const members = pgTable("members", {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }),
	phone: varchar("phone", { length: 20 }),
	address: text("address"),
	registeredAt: date("registered_at").defaultNow(),
});

export const loans = pgTable("loans", {
	id: uuid().primaryKey().defaultRandom(),
	memberId: uuid("member_id")
		.references(() => members.id)
		.notNull(),
	bookId: integer("book_id")
		.references(() => books.id)
		.notNull(),
	loanDate: date("loan_date").defaultNow(),
	returnDate: date("return_date"),
	returnedAt: date("returned_at"), // jika null berarti belum dikembalikan
});

export const loanRelations = relations(loans, ({ one }) => ({
	member: one(members, {
		fields: [loans.memberId],
		references: [members.id],
	}),
	book: one(books, {
		fields: [loans.bookId],
		references: [books.id],
	}),
}));
