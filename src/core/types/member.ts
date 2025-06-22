import type { members } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Member = InferSelectModel<typeof members>;
