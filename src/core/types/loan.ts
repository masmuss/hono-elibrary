import type { loans } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Loan = InferSelectModel<typeof loans>;
