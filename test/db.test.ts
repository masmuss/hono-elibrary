import db from "@/db";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "bun:test";

describe("Database Connection", () => {
    it("should connect to the database and execute a simple query", async () => {
        try {
            const result = await db.execute(sql`SELECT now()`);

            expect(result).toBeDefined();

            expect(Array.isArray(result.rows)).toBe(true);
            expect(result.rows.length).toBeGreaterThan(0);

            console.log(
                "Database connection test successful. Server time:",
                result.rows[0].now,
            );
        } catch (error) {
            console.error("Database connection test failed:", error);
            expect(error).toBeUndefined();
        }
    });
});

describe("Database Schema Verification", () => {
    it("should be connected to the correct database", async () => {
        const result = await db.execute(sql`SELECT current_database()`);
        const dbName = result.rows[0].current_database;

        const expectedDbName = process.env.DATABASE_URL?.split("/").pop();

        expect(dbName).toBe(expectedDbName);
    });

    it("should have all required tables created", async () => {
        const expectedTables = [
            "roles",
            "users",
            "categories",
            "books",
            "members",
            "loans",
        ];

        const result = await db.execute(
            sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
        );

        const actualTables = result.rows.map((row) => row.table_name);

        expectedTables.forEach((table) => {
            expect(actualTables).toContain(table);
        });
    });
});