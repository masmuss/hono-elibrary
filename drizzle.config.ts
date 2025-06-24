import env from "@/config/env-runtime";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		host: env.POSTGRES_HOST,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		port: Number.parseInt(env.POSTGRES_PORT),
		database: env.POSTGRES_DB,
	},
});
