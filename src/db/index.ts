import { drizzle } from "drizzle-orm/node-postgres";
import { Environment } from "@/env";
import * as schema from "@/db/schema";

export function createDb(env: Environment) {
  return drizzle({
    connection: env.DATABASE_URL,
    casing: "snake_case",
    schema,
  });
}
