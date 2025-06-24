import type { categories } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Category = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;
