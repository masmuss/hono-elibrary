import { describe, it, expect } from "bun:test";

describe("Environment Variable Configuration for Testing", () => {
    it('should correctly set NODE_ENV to "test"', () => {
        expect(process.env.NODE_ENV).toBe("test");
    });

    describe("Database Variables", () => {
        it("should have all required PostgreSQL variables defined", () => {
            expect(process.env.POSTGRES_HOST).toBeDefined();
            expect(process.env.POSTGRES_PORT).toBeDefined();
            expect(process.env.POSTGRES_USER).toBeDefined();
            expect(process.env.POSTGRES_PASSWORD).toBeDefined();
            expect(process.env.POSTGRES_DB).toBeDefined();
        });
    });

    describe("Redis Variables", () => {
        it("should have the correct Redis URL for local testing", () => {
            expect(process.env.REDIS_URL).toBeDefined();
        });
    });

    describe("SMTP Variables", () => {
        it("should have all required SMTP variables defined", () => {
            expect(process.env.SMTP_HOST).toBeDefined();
            expect(process.env.SMTP_PORT).toBeDefined();
            expect(process.env.SMTP_USER).toBeDefined();
            expect(process.env.SMTP_PASS).toBeDefined();
            expect(process.env.EMAIL_FROM).toBeDefined();
        });
    });

    describe("JWT Variables", () => {
        it("should have a JWT_SECRET defined and not empty", () => {
            expect(process.env.JWT_SECRET).toBeDefined();
            expect(process.env.JWT_SECRET?.length).toBeGreaterThan(10);
        });
    });
});