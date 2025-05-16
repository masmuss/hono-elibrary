import type { books } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Book = InferSelectModel<typeof books>;
export type BookInsert = InferInsertModel<typeof books>;
