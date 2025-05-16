import envRuntime from "@/config/env-runtime";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
	connection: envRuntime.DATABASE_URL,
	casing: "snake_case",
	schema,
	logger: true,
});

export default db;
