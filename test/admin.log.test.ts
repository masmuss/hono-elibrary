import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import { createTestUser, createTestBook, createTestCategory } from "test/utils/data-helpers";
import { generateAuthToken } from "test/utils/auth-helpers";
import type { User } from "@/core/types/user";
import type { ApiPaginatedResponse, ApiSuccessResponse } from "./types";
import db from "@/db";
import { auditLogs } from "@/db/schema";

describe("Admin Audit Log Endpoint", () => {
    let adminUser: User;
    let librarianUser: User;
    let adminToken: string;
    let memberToken: string;

    beforeEach(async () => {
        adminUser = (await createTestUser(UserRole.ADMIN)).user;
        const memberUser = (await createTestUser(UserRole.MEMBER)).user;
        librarianUser = (await createTestUser(UserRole.LIBRARIAN)).user;

        adminToken = await generateAuthToken({ id: adminUser.id, role: UserRole.ADMIN });
        memberToken = await generateAuthToken({ id: memberUser.id, role: UserRole.MEMBER });
        const librarianToken = await generateAuthToken({ id: librarianUser.id, role: UserRole.LIBRARIAN });

        const testCategory = await createTestCategory();
        await app.request("/api/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${librarianToken}`,
            },
            body: JSON.stringify({
                isbn: "978-3-16-148410-0",
                title: "A Book to be Logged",
                author: "Test Author",
                publisher: "Test Publisher",
                totalPages: 100,
                publicationYear: 2025,
                totalCopies: 10,
                availableCopies: 10,
                categoryId: testCategory.id
            }),
        });
    });

    it("should allow an ADMIN to retrieve audit logs", async () => {
        const res = await app.request("/api/admin/logs", {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const body = await res.json() as ApiPaginatedResponse;

        expect(res.status).toBe(200);
        expect(body.message).toBe("Audit logs retrieved successfully");
        expect(body).toHaveProperty("data");
        expect(body).toHaveProperty("total");
        expect(body).toHaveProperty("totalPages");
        expect(body).toHaveProperty("page");
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 403 Forbidden for a non-admin user (MEMBER)", async () => {
        const res = await app.request("/api/admin/logs", {
            headers: { Authorization: `Bearer ${memberToken}` },
        });

        expect(res.status).toBe(403);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
        const res = await app.request("/api/admin/logs");
        expect(res.status).toBe(401);
    });

    it("should handle pagination correctly", async () => {
        await db.insert(auditLogs).values({ action: "TEST_1", status: "SUCCESS", userId: adminUser.id });
        await db.insert(auditLogs).values({ action: "TEST_2", status: "SUCCESS", userId: adminUser.id });

        const res = await app.request("/api/admin/logs?page=1&pageSize=2", {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const body = await res.json() as ApiPaginatedResponse;

        expect(res.status).toBe(200);
        expect(body.data.length).toBe(2);
        expect(body.page).toBe(1);
        expect(body.total).toBeGreaterThanOrEqual(3);
    });
});