import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import envRuntime from "@/env-runtime";

const db = drizzle({
  connection: envRuntime.DATABASE_URL,
  casing: "snake_case",
  schema,
  logger: true
});

export default db;
