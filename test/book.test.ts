import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import {
    createTestBook,
    createTestCategory,
    createTestUser,
} from "test/utils/data-helpers";
import { generateAuthToken } from "test/utils/auth-helpers";
import type { Book } from "@/core/types/book";
import type { ApiErrorResponse, ApiPaginatedResponse, ApiSuccessResponse } from "./types";

type Body = {
    data: Book | Book[] | [] | null;
    message?: string;
    errors?: { path: string; message: string }[] | null;
}

describe("Book Endpoints", () => {
    let adminToken: string;
    let memberToken: string;
    let testBook1: Book;
    let testCategory: { id: number; name: string };

    beforeEach(async () => {
        const adminUser = (await createTestUser(UserRole.ADMIN)).user;
        const memberUser = (await createTestUser(UserRole.MEMBER)).user;

        adminToken = await generateAuthToken({ id: adminUser.id, role: UserRole.ADMIN });
        memberToken = await generateAuthToken({ id: memberUser.id, role: UserRole.MEMBER });

        testCategory = await createTestCategory();
        testBook1 = await createTestBook(testCategory.id);
        await createTestBook(testCategory.id);
    });

    describe("GET /api/books", () => {
        it("should return a list of books", async () => {
            const res = await app.request("/api/books");
            const body = await res.json() as ApiSuccessResponse<Book[]>;

            expect(res.status).toBe(200);
            expect(body.data).toBeArray();
            expect(Array(body.data!).length).toBeGreaterThanOrEqual(1);
            expect(body.message).toBe("Books retrieved successfully");
        });

        it("should handle pagination correctly", async () => {
            const res = await app.request("/api/books?page=1&pageSize=1");
            const body = await res.json() as ApiPaginatedResponse<Book>;

            expect(res.status).toBe(200);
            expect(body.data).toBeArray()
            expect(body.data.length).toBe(1);
            expect(body.page).toBe(1);
        });
    });

    describe("GET /api/books/:id", () => {
        it("should return a single book for a valid ID", async () => {
            const res = await app.request(`/api/books/${testBook1.id}`);
            const body = await res.json() as ApiSuccessResponse<Book>;

            expect(res.status).toBe(200);
            expect(body.data).toBeObject();
            expect(body.data.id).toBe(testBook1.id);
            expect(body.data.title).toBe(testBook1.title);
        });

        it("should return 404 for a non-existent ID", async () => {
            const res = await app.request("/api/books/99999");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /api/books", () => {
        const newBookData = {
            isbn: "9783161484100",
            title: "The Art of Testing",
            author: "Tester Extraordinaire",
            publisher: "Quality Press",
            synopsis: "A comprehensive guide to software testing.",
            totalPages: 300,
            publicationYear: 2025,
            totalCopies: 10,
            availableCopies: 10,
        };

        it("should create a new book for an ADMIN user", async () => {
            const res = await app.request("/api/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ ...newBookData, categoryId: testCategory.id }),
            });

            const body = await res.json() as ApiSuccessResponse<Book>;

            expect(res.status).toBe(201);
            expect(body.data.title).toBe(newBookData.title);
            expect(body.data.author).toBe(newBookData.author);
            expect(body.data.categoryId).toBe(testCategory.id);
            expect(body.data.isbn).toBe(newBookData.isbn);
            expect(body.data.totalCopies).toBe(newBookData.totalCopies);
            expect(body.data.availableCopies).toBe(newBookData.availableCopies);
            expect(body.data.publicationYear).toBe(newBookData.publicationYear);
            expect(body.data.totalPages).toBe(newBookData.totalPages);
            expect(body.message).toBe("Book created successfully");
        });

        it("should return 403 Forbidden for a MEMBER user", async () => {
            const res = await app.request("/api/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify(newBookData),
            });

            expect(res.status).toBe(403);
        });

        it("should return 401 Unauthorized if no token is provided", async () => {
            const res = await app.request("/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBookData),
            });

            expect(res.status).toBe(401);
        });

        it("should return 422 for invalid data", async () => {
            const invalidData = { ...newBookData, title: "" };
            const res = await app.request("/api/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify(invalidData),
            });

            const body = await res.json() as ApiErrorResponse<Book>;

            expect(res.status).toBe(422);
            expect(body.error.code).toInclude("VALIDATION_ERROR");
            expect(body.error.message).toBe("The provided data is invalid.");
        });
    });

    describe("DELETE /api/books/:id", () => {
        let bookToDelete: Book;

        beforeEach(async () => {
            bookToDelete = await createTestBook(testCategory.id);
        });

        it("should soft delete a book for an ADMIN user", async () => {
            const res = await app.request(`/api/books/${bookToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toBe("Book deleted successfully");
        });

        it("should return 401 when trying to delete a book without a token", async () => {
            const res = await app.request(`/api/books/${bookToDelete.id}`, {
                method: "DELETE",
            });

            expect(res.status).toBe(401);
        });

        it("should return 422 when trying to delete a book with an invalid ID", async () => {
            const res = await app.request("/api/books/invalid-id", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(422);
        });

        it("should return 404 when trying to delete a non-existent book", async () => {
            const res = await app.request("/api/books/99999", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(404);
        });

        it("should return 403 when a MEMBER user tries to delete a book", async () => {
            const anotherBook = await createTestBook(testCategory.id);
            const res = await app.request(`/api/books/${anotherBook.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });
    });

    describe("POST /api/books/:id/restore", () => {
        let softDeletedBook: Book;

        beforeEach(async () => {
            const bookToCreate = await createTestBook(testCategory.id);
            await app.request(`/api/books/${bookToCreate.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            softDeletedBook = bookToCreate;
        });

        it("should restore a soft-deleted book for an ADMIN user", async () => {
            const res = await app.request(`/api/books/${softDeletedBook.id}/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toBe("Book restored successfully");

            const getRes = await app.request(`/api/books/${softDeletedBook.id}`);
            expect(getRes.status).toBe(200);
            const restoredBody = await getRes.json() as ApiSuccessResponse<Book>;
            expect(restoredBody.data).toBeObject();
            expect(restoredBody.data.id).toBe(softDeletedBook.id);
        });

        it("should return 403 for a MEMBER user trying to restore", async () => {
            const res = await app.request(`/api/books/${softDeletedBook.id}/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });

        it("should return 404 if trying to restore a book that is not soft-deleted", async () => {
            const activeBook = await createTestBook(testCategory.id);
            const res = await app.request(`/api/books/${activeBook.id + 1}/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /api/books/:id/hard-delete", () => {
        it("should permanently delete a book for an ADMIN user", async () => {
            const bookToHardDelete = await createTestBook(testCategory.id);

            const res = await app.request(
                `/api/books/${bookToHardDelete.id}/hard-delete`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${adminToken}` },
                },
            );

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toBe("Book permanently deleted");

            const getRes = await app.request(`/api/books/${bookToHardDelete.id}`);
            expect(getRes.status).toBe(404);
        });

        it("should return 403 for a MEMBER user trying to hard-delete", async () => {
            const bookToHardDelete = await createTestBook(testCategory.id);
            const res = await app.request(
                `/api/books/${bookToHardDelete.id}/hard-delete`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${memberToken}` },
                },
            );
            expect(res.status).toBe(403);
        });
    });
});