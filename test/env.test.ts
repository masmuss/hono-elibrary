import { describe, it, expect } from "bun:test";

describe("Environment Variable Setup for Testing", () => {
    it("should correctly load NODE_ENV as 'test'", () => {
        expect(process.env.NODE_ENV).toBe("test");
    });

    it("should have DATABASE_URL defined", () => {
        expect(process.env.DATABASE_URL).toBeDefined();
        expect(process.env.DATABASE_URL).not.toBeEmpty();
    });

    it("should have JWT_SECRET defined", () => {
        expect(process.env.JWT_SECRET).toBeDefined();
        expect(process.env.JWT_SECRET).not.toBeEmpty();
    });

    it("DATABASE_URL should point to the correct test database port", () => {
        expect(process.env.DATABASE_URL).toInclude("localhost:5433");
    });
});