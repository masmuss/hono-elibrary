import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@/db/schema";

export type DbInstance = Pick<
	NodePgDatabase<typeof schema>,
	"select" | "insert" | "update" | "delete" | "query"
>;
