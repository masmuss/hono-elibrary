import type { users } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
