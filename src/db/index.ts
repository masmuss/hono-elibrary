import envRuntime from "@/config/env-runtime";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
	host: envRuntime.POSTGRES_HOST,
	user: envRuntime.POSTGRES_USER,
	password: envRuntime.POSTGRES_PASSWORD,
	port: Number.parseInt(envRuntime.POSTGRES_PORT, 10),
	database: envRuntime.POSTGRES_DB,
});

const db = drizzle(pool, {
	casing: "snake_case",
	schema,
	logger: false,
});

export default db;
