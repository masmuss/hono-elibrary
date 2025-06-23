import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import {
    createTestBook,
    createTestCategory,
    createTestLoan,
    createTestMember,
    createTestUser,
} from "test/utils/data-helpers";
import { generateAuthToken } from "test/utils/auth-helpers";
import type { Book } from "@/core/types/book";
import type { User } from "@/core/types/user";
import { LoanStatus } from "@/lib/constants/enums/loan-status.enum";
import type { Loan } from "@/core/types/loan";
import type { Member } from "@/core/types/member";
import { ApiErrorResponse, ApiSuccessResponse } from "./types";

type LoanResponse = {
    book: Book;
    member: {
        user: User
    };
    librarian?: User;
}

type ExtensibleLoan = Loan & LoanResponse;

describe("Loan Endpoints", () => {
    let adminToken: string;
    let librarianToken: string;
    let memberToken: string;

    let librarianUser: User;
    let memberUser: User;
    let testMember: Member;
    let testBook: Book;

    beforeEach(async () => {
        const admin = (await createTestUser(UserRole.ADMIN)).user;
        librarianUser = (await createTestUser(UserRole.LIBRARIAN)).user;
        memberUser = (await createTestUser(UserRole.MEMBER)).user;

        testMember = await createTestMember(memberUser.id);

        adminToken = await generateAuthToken({ id: admin.id, role: UserRole.ADMIN });
        librarianToken = await generateAuthToken({ id: librarianUser.id, role: UserRole.LIBRARIAN });
        memberToken = await generateAuthToken({ id: memberUser.id, role: UserRole.MEMBER });

        const testCategory = await createTestCategory();
        testBook = await createTestBook(testCategory.id);
    });

    describe("POST /api/loans", () => {
        it("should allow a member to create a loan request", async () => {
            const res = await app.request("/api/loans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify({ memberId: testMember.id, bookId: testBook.id }),
            });
            const body = await res.json() as ApiSuccessResponse<ExtensibleLoan>;

            expect(res.status).toBe(201);
            expect(body.message).toBe("Loan created successfully");
            expect(body.data.book.title).toBe(testBook.title);
            expect(body.data.status).toBe(LoanStatus.PENDING);
        });

        it("should return 400 if member has an active loan for the same book", async () => {
            await createTestLoan(testMember.id, testBook.id, LoanStatus.APPROVED, librarianUser.id);

            const res = await app.request("/api/loans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify({ memberId: testMember.id, bookId: testBook.id }),
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error).toContain("sudah memiliki pinjaman aktif");
        });

        it("should return 403 for an ADMIN trying to create a loan", async () => {
            const res = await app.request("/api/loans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ memberId: testMember.id, bookId: testBook.id }),
            });

            expect(res.status).toBe(403);
        });
    });

    describe("Loan Management by Librarian/Admin", () => {
        let pendingLoan: Loan;

        beforeEach(async () => {
            pendingLoan = await createTestLoan(testMember.id, testBook.id, LoanStatus.PENDING);
        });

        it("should allow a LIBRARIAN to get all loans", async () => {
            const res = await app.request("/api/loans", {
                headers: { Authorization: `Bearer ${librarianToken}` },
            });
            const body = await res.json() as ApiSuccessResponse<ExtensibleLoan[]>;

            expect(res.status).toBe(200);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
        });

        it("should return 403 for a MEMBER trying to get all loans", async () => {
            const res = await app.request("/api/loans", {
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            expect(res.status).toBe(403);
        });

        it("should allow a LIBRARIAN to approve a loan", async () => {
            const res = await app.request(`/api/loans/${pendingLoan.id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });
            const body = await res.json() as ApiSuccessResponse<ExtensibleLoan>;

            expect(res.status).toBe(200);
            expect(body.data.status).toBe(LoanStatus.APPROVED);
            expect(body.data.librarian?.email).toBe(librarianUser.email);
        });

        it("should allow a LIBRARIAN to reject a loan", async () => {
            const res = await app.request(`/api/loans/${pendingLoan.id}/reject`, {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });
            const body = await res.json() as ApiSuccessResponse<ExtensibleLoan>;

            expect(res.status).toBe(200);
            expect(body.data.status).toBe(LoanStatus.REJECTED);
        });

        it("should return 400 if trying to approve an already approved loan", async () => {
            await app.request(`/api/loans/${pendingLoan.id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });

            const res = await app.request(`/api/loans/${pendingLoan.id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error).toContain("sudah dalam status: approved");
        });
    });

    describe("POST /api/loans/:id/return", () => {
        let approvedLoan: any;

        beforeEach(async () => {
            const pendingLoan = await createTestLoan(testMember.id, testBook.id, LoanStatus.PENDING);
            const res = await app.request(`/api/loans/${pendingLoan.id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${librarianToken}` },
            });
            const body = await res.json() as ApiErrorResponse;
            approvedLoan = body.data && !Array.isArray(body.data) && (body.data as any).loan ? (body.data as any).loan : body.data;
        });

        it("should allow a MEMBER to return their loan", async () => {
            const res = await app.request(`/api/loans/${approvedLoan.id}/return`, {
                method: "POST",
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            const body = await res.json() as ApiSuccessResponse;

            expect(res.status).toBe(200);
            expect(body.message).toBe("Loan returned successfully");
        });

        it("should return 400 if trying to return a loan that is not 'approved'", async () => {
            const newPendingLoan = await createTestLoan(testMember.id, testBook.id, LoanStatus.PENDING);

            const res = await app.request(`/api/loans/${newPendingLoan.id}/return`, {
                method: "POST",
                headers: { Authorization: `Bearer ${memberToken}` },
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error).toContain("statusnya: pending");
        });
    });
});