import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import { generateAuthToken } from "test/utils/auth-helpers";
import { createTestUser, createTestCategory, createTestBook } from "test/utils/data-helpers";
import type { Category } from "@/core/repositories/category.repository";

interface CategoryResponse<T = any> {
    message: string;
    data: T;
    error: string | null;
}

describe("Category Endpoints", () => {
    let adminToken: string;
    let memberToken: string;
    let librarianToken: string;
    let testCategory: Category;

    beforeEach(async () => {
        const adminUser = (await createTestUser(UserRole.ADMIN)).user;
        const memberUser = (await createTestUser(UserRole.MEMBER)).user;
        const librarianUser = (await createTestUser(UserRole.LIBRARIAN)).user;

        adminToken = await generateAuthToken({ id: adminUser.id, role: UserRole.ADMIN });
        memberToken = await generateAuthToken({ id: memberUser.id, role: UserRole.MEMBER });
        librarianToken = await generateAuthToken({ id: librarianUser.id, role: UserRole.LIBRARIAN });

        testCategory = await createTestCategory();
    });

    describe("GET /api/categories", () => {
        it("should allow anyone to get a list of categories", async () => {
            const res = await app.request("/api/categories");
            const body = await res.json() as CategoryResponse<Category[]>;
            expect(res.status).toBe(200);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Librarian Category Management", () => {
        it("should allow an LIBRARIAN to create a new category", async () => {
            const newCategoryData = { name: "Horror" };
            const res = await app.request("/api/categories", {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(newCategoryData),
            });
            const body = await res.json() as CategoryResponse<Category>;
            expect(res.status).toBe(201);
            expect(body.data.name).toBe(newCategoryData.name);
        });

        it("should NOT allow a MEMBER to create a category", async () => {
            const res = await app.request("/api/categories", {
                method: "POST",
                headers: { Authorization: `Bearer ${memberToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Attempted Category" }),
            });
            expect(res.status).toBe(403);
        });

        it("should NOT allow an ADMIN to create a category", async () => {
            const res = await app.request("/api/categories", {
                method: "POST",
                headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Attempted Category" }),
            });
            expect(res.status).toBe(403);
        });

        it("should allow an LIBRARIAN to update a category", async () => {
            const categoryToUpdate = await createTestCategory();
            const updatedData = { name: "Updated Science Fiction" };
            const res = await app.request(`/api/categories/${categoryToUpdate.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${librarianToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            const body = await res.json() as CategoryResponse<Category>;
            expect(res.status).toBe(200);
            expect(body.data.name).toBe(updatedData.name);
        });

        it("should NOT allow a MEMBER to update a category", async () => {
            const categoryToUpdate = await createTestCategory();
            const updatedData = { name: "Attempted Update" };
            const res = await app.request(`/api/categories/${categoryToUpdate.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${memberToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            expect(res.status).toBe(403);
        });

        it("should NOT allow an ADMIN to update a category", async () => {
            const categoryToUpdate = await createTestCategory();
            const updatedData = { name: "Attempted Update" };
            const res = await app.request(`/api/categories/${categoryToUpdate.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            expect(res.status).toBe(403);
        });

        it("should allow an LIBRARIAN to delete an unused category", async () => {
            const categoryToDelete = await createTestCategory();
            const res = await app.request(`/api/categories/${categoryToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });
            expect(res.status).toBe(200);
        });

        it("should NOT allow a MEMBER to delete a category", async () => {
            const categoryToDelete = await createTestCategory();
            const res = await app.request(`/api/categories/${categoryToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });

        it("should NOT allow an ADMIN to delete a category", async () => {
            const categoryToDelete = await createTestCategory();
            const res = await app.request(`/api/categories/${categoryToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            expect(res.status).toBe(403);
        });

        it("should NOT allow deleting a category that is in use by a book", async () => {
            const categoryInUse = await createTestCategory();
            await createTestBook(categoryInUse.id);

            const res = await app.request(`/api/categories/${categoryInUse.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });

            expect(res.status).toBe(500);
        });
    });
});