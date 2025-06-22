import { relations } from "drizzle-orm";
import {
	date,
	integer,
	pgTable,
	text,
	timestamp,
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
	totalPages: integer("total_pages").notNull(),
	coverImageUrl: varchar("cover_image_url", { length: 255 }),
	publicationYear: integer("publication_year").notNull(),
	totalCopies: integer("total_copies").notNull().default(1),
	availableCopies: integer("available_copies").notNull().default(1),
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
	phone: varchar("phone", { length: 50 }),
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
	librarianId: uuid("librarian_id").references(() => users.id),
	bookId: integer("book_id")
		.references(() => books.id, { onDelete: "cascade" })
		.notNull(),
	loanDate: timestamp("loan_date").notNull().defaultNow(),
	dueDate: timestamp("due_date"),
	status: varchar("status", {
		length: 20,
		enum: ["pending", "approved", "rejected", "returned"],
	})
		.notNull()
		.default("pending"),
	approvedAt: timestamp("approved_at"),
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
	librarian: one(users, {
		fields: [loans.librarianId],
		references: [users.id],
	}),
}));
