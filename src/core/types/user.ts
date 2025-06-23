import type { users } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserInsert>;
