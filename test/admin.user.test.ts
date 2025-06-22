import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import { createTestUser } from "test/utils/data-helpers";
import { generateAuthToken } from "test/utils/auth-helpers";
import db from "@/db";
import { eq } from "drizzle-orm";
import { roles, users } from "@/db/schema";
import { User } from "@/core/types/user";

interface AdminUserResponse<T = any> {
    message: string;
    data: T;
    error: string | null;
}

describe("Admin User Management Endpoints", () => {
    let adminToken: string;
    let memberToken: string;
    let memberRoleId: number;

    beforeEach(async () => {
        const adminUser = (await createTestUser(UserRole.ADMIN)).user;
        const memberUser = (await createTestUser(UserRole.MEMBER)).user;

        adminToken = await generateAuthToken({ id: adminUser.id, role: UserRole.ADMIN });
        memberToken = await generateAuthToken({ id: memberUser.id, role: UserRole.MEMBER });

        const memberRoleData = await db.query.roles.findFirst({ where: eq(roles.name, UserRole.MEMBER) })
        memberRoleId = memberRoleData!.id;
    });

    describe("GET /api/admin/users", () => {
        it("should allow an ADMIN to get all users", async () => {
            const res = await app.request("/api/admin/users", {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            expect(res.status).toBe(200);
            const body = await res.json() as AdminUserResponse<User[]>;
            expect(body.data.length).toBeGreaterThanOrEqual(2);
        });

        it("should return 403 Forbidden for a non-admin user", async () => {
            const res = await app.request("/api/admin/users", {
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });
    });

    describe("POST /api/admin/users", () => {
        const newUserPayload = {
            name: "New Librarian",
            username: "newlibrarian",
            email: "librarian@example.com",
            password: "password12345",
            roleId: 0,
        };

        beforeEach(async () => {
            const librarianRole = await db.query.roles.findFirst({ where: eq(roles.name, UserRole.LIBRARIAN) })
            newUserPayload.roleId = librarianRole!.id;
        })

        it("should allow an ADMIN to create a new user with a specific role", async () => {
            const res = await app.request("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify(newUserPayload),
            });

            expect(res.status).toBe(201);
            const body = await res.json() as AdminUserResponse<User>;
            expect(body.data.username).toBe(newUserPayload.username);
        });

        it("should return 403 for a MEMBER user trying to create a user", async () => {
            const res = await app.request("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify(newUserPayload),
            });
            expect(res.status).toBe(403);
        });
    });

    describe("GET /api/admin/users/:id", () => {
        let userToGet: User;

        beforeEach(async () => {
            userToGet = (await createTestUser(UserRole.MEMBER)).user;
        });

        it("should allow an ADMIN to get a user by ID", async () => {
            const res = await app.request(`/api/admin/users/${userToGet.id}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const body = await res.json() as AdminUserResponse<User>;

            expect(res.status).toBe(200);
            expect(body.data.id).toBe(userToGet.id);
        });

        it('should return 403 for a non-admin user', async () => {
            const res = await app.request(`/api/admin/users/${userToGet.id}`, {
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });

        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const res = await app.request(`/api/admin/users/${nonExistentId}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/admin/users/:id", () => {
        let userToUpdate: User;
        let librarianRoleId: number;

        beforeEach(async () => {
            userToUpdate = (await createTestUser(UserRole.MEMBER)).user;

            const librarianRole = await db.query.roles.findFirst({ where: eq(roles.name, UserRole.LIBRARIAN) });
            librarianRoleId = librarianRole!.id;
        });

        it("should allow an ADMIN to update a user's name and role", async () => {
            const updatePayload = {
                name: "Updated Name",
                roleId: librarianRoleId,
            };

            const res = await app.request(`/api/admin/users/${userToUpdate.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify(updatePayload),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as AdminUserResponse<User>;
            expect(body.data.name).toBe("Updated Name");

            const userInDb = await db.query.users.findFirst({ where: eq(users.id, userToUpdate.id) });
            expect(userInDb?.roleId).toBe(librarianRoleId);
        });

        it("should return 403 for a MEMBER user trying to update another user", async () => {
            const res = await app.request(`/api/admin/users/${userToUpdate.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify({ name: "Attempted Hack" }),
            });
            expect(res.status).toBe(403);
        });

        it("should return 404 if user ID does not exist", async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const res = await app.request(`/api/admin/users/${nonExistentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ name: "Does Not Matter" }),
            });
            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        let userToDelete: User;

        beforeEach(async () => {
            userToDelete = (await createTestUser(UserRole.MEMBER)).user;
        });

        it("should allow an ADMIN to soft-delete a user", async () => {
            const res = await app.request(`/api/admin/users/${userToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(200);
            const body = await res.json() as AdminUserResponse;
            expect(body.message).toBe("User deleted successfully");

            const userInDb = await db.query.users.findFirst({ where: eq(users.id, userToDelete.id) });
            expect(userInDb?.deletedAt).not.toBeNull();
        });

        it('should return 403 for a non-admin user', async () => {
            const res = await app.request(`/api/admin/users/${userToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });
    });
});