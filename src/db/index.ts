import envRuntime from "@/config/env-runtime";
import * as schema from "@/db/schema";
import type { Logger } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

class QueryLogger implements Logger {
	private queries: string[] = [];

	logQuery(query: string, params: unknown[]): void {
		const formattedQuery = query.replace(/\$(\d+)/g, (_, i) => {
			const param = params[i - 1];
			return typeof param === 'string' ? `'${param}'` : String(param);
		});
		this.queries.push(formattedQuery);
	}

	getQueries(): string[] {
		return this.queries;
	}
}

const pool = new Pool({
	host: envRuntime.POSTGRES_HOST,
	user: envRuntime.POSTGRES_USER,
	password: envRuntime.POSTGRES_PASSWORD,
	port: Number.parseInt(envRuntime.POSTGRES_PORT, 10),
	database: envRuntime.POSTGRES_DB,
});

export const createDrizzle = (logger?: Logger): NodePgDatabase<typeof schema> => {
	return drizzle(pool, {
		casing: "snake_case",
		schema,
		logger: logger,
	});
}

const db = createDrizzle();
export default db;

export { QueryLogger };

