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

export const roles = pgTable("roles", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: varchar("name", { length: 50 }).notNull(),
	description: text("description"),
	...timestamps,
});

export const users = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	username: varchar("username", { length: 50 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	salt: varchar("salt", { length: 255 }).notNull(),
	roleId: integer("role_id")
		.references(() => roles.id)
		.notNull(),
	...timestamps,
});

export const userRelations = relations(users, ({ one }) => ({
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id],
	}),
}));

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
	stock: integer("stock").notNull().default(1),
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
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),
	phone: varchar("phone", { length: 20 }),
	address: text("address"),
	...timestamps,
});

export const memberRelations = relations(members, ({ one }) => ({
	user: one(users, {
		fields: [members.userId],
		references: [users.id],
	}),
}));

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
	...timestamps,
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
