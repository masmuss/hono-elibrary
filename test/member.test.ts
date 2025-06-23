import app from "@/index";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { describe, expect, it, beforeEach } from "bun:test";
import { createTestUser, createTestMember } from "test/utils/data-helpers";
import { generateAuthToken } from "test/utils/auth-helpers";
import type { User } from "@/core/types/user";
import db from "@/db";
import { eq } from "drizzle-orm";
import { users, members } from "@/db/schema";
import { Member } from "@/core/types/member";
import { ApiSuccessResponse } from "./types";

describe("Member Profile Endpoints", () => {
    let testUser: User;
    let testMember: Member;
    let memberToken: string;

    beforeEach(async () => {
        const { user } = await createTestUser(UserRole.MEMBER);
        testUser = user;
        testMember = await createTestMember(user.id);
        memberToken = await generateAuthToken({ id: user.id, role: UserRole.MEMBER });
    });

    describe("GET /api/members/profile", () => {
        it("should return the correct profile for the logged-in member", async () => {
            const res = await app.request("/api/members/profile", {
                headers: { Authorization: `Bearer ${memberToken}` },
            });
            const body = await res.json() as ApiSuccessResponse;

            expect(res.status).toBe(200);
            expect(body.data.id).toBe(testMember.id);
            expect(body.data.user.id).toBe(testUser.id);
            expect(body.data.user.name).toBe(testUser.name);
        });

        it("should return 401 for an unauthenticated request", async () => {
            const res = await app.request("/api/members/profile");
            expect(res.status).toBe(401);
        });
    });

    describe("PUT /api/members/profile", () => {
        it("should allow a member to update their own profile", async () => {
            const updatePayload = {
                name: "New Updated Name",
                phone: "111222333444",
            };

            const res = await app.request("/api/members/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify(updatePayload),
            });
            const body = await res.json() as ApiSuccessResponse;

            expect(res.status).toBe(200);
            expect(body.data.user.name).toBe(updatePayload.name);
            expect(body.data.phone).toBe(updatePayload.phone);

            const memberInDb = await db.query.members.findFirst({ where: eq(members.id, testMember.id) });
            const userInDb = await db.query.users.findFirst({ where: eq(users.id, testUser.id) });

            expect(memberInDb?.phone).toBe(updatePayload.phone);
            expect(userInDb?.name).toBe(updatePayload.name);
        });

        it("should return 422 for invalid data (e.g., short phone number)", async () => {
            const invalidPayload = { phone: "123" };
            const res = await app.request("/api/members/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${memberToken}`,
                },
                body: JSON.stringify(invalidPayload),
            });

            expect(res.status).toBe(422);
        });
    });
});