import { users, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '@/lib/constants/enums/user-roles.enum';
import db from '@/db';

import { describe, beforeAll, it, expect, beforeEach, mock } from 'bun:test'
import app from '@/index';
import { createTestUser } from './utils/data-helpers';
import { generateAuthToken } from './utils/auth-helpers';
import { ApiErrorResponse, ApiSuccessResponse } from './types';
import { User } from '@/core/types/user';
import { UserRepository } from '@/core/repositories/user.repository';

mock.module("@/lib/mailer", () => ({
    sendPasswordResetEmail: async (email: string, token: string) => {
        console.log(`Mocked email sent to ${email} with token ${token}`);
        return;
    },
}));

describe('Auth Endpoints', () => {
    let adminRole: { id: number; name: string };
    let memberRole: { id: number; name: string };

    beforeAll(async () => {
        adminRole = (await db.query.roles.findFirst({ where: eq(roles.name, UserRole.ADMIN) }))!;
        memberRole = (await db.query.roles.findFirst({ where: eq(roles.name, UserRole.MEMBER) }))!;
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                username: 'testuser_register',
                email: 'register@example.com',
                password: 'password123',
            };

            const res = await app
                .request('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify(userData),
                })

            const body = await res.json() as ApiSuccessResponse<User>;

            expect(res.status).toBe(201);
            expect(body.data.name).toBe(userData.name);
            expect(body.data.username).toBe(userData.username);
            expect(body.data.email).toBe(userData.email);
        });

        it('should return 409 if username already exists', async () => {
            await createTestUser(UserRole.MEMBER);
            const existingUser = await db.query.users.findFirst();
            const userData = {
                name: 'Another User',
                username: existingUser?.username,
                email: 'another@example.com',
                password: 'password123',
            };

            const res = await app
                .request('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(userData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(409);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('USER_ALREADY_EXISTS');
            expect(body.error.message).toBe('User with same username or email already exists');
        });

        it('should return 409 if email already exists', async () => {
            await createTestUser(UserRole.MEMBER);
            const existingUser = await db.query.users.findFirst();
            const userData = {
                name: 'Another User',
                username: 'another_user',
                email: existingUser?.email,
                password: 'password123',
            };

            const res = await app
                .request('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(userData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(409);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('USER_ALREADY_EXISTS');
            expect(body.error.message).toBe('User with same username or email already exists');
        });

        it('should return 422 for invalid request body (validation error)', async () => {
            const invalidUserData = {
                username: 'sh', // Too short
                password: '123', // Too short
                email: 'invalid-email',
                name: 'ab', // Too short
            };

            const res = await app
                .request('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(invalidUserData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(422);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('VALIDATION_ERROR');
            expect(body.error.message).toEqual('The provided data is invalid.');
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser: any;
        let testPassword = 'testpassword123';

        beforeEach(async () => {
            const { user, password } = await createTestUser(UserRole.MEMBER);
            testUser = user;
            testPassword = password;
        });

        it('should log in a registered user successfully', async () => {
            const loginCredentials = {
                username: testUser.username,
                password: testPassword,
            };

            const res = await app
                .request('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(loginCredentials),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiSuccessResponse;

            expect(res.status).toBe(200);
            expect(body.data).toHaveProperty('id', testUser.id);
            expect(body.data).toHaveProperty('username', testUser.username);
            expect(body.data).toHaveProperty('name', testUser.name);
            expect(body.data).toHaveProperty('token');
        });

        it('should return 401 with error message for invalid username', async () => {
            const loginCredentials = {
                username: 'nonexistentuser',
                password: testPassword,
            };

            const res = await app
                .request('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(loginCredentials),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(401);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('INVALID_CREDENTIALS');
            expect(body.error.message).toBe('Invalid username or password');
        });

        it('should return 401 with error message for invalid password', async () => {
            const loginCredentials = {
                username: testUser.username,
                password: 'wrongpassword',
            };

            const res = await app
                .request('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(loginCredentials),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(401);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('INVALID_CREDENTIALS');
            expect(body.error.message).toBe('Invalid username or password');
        });
    });

    describe("POST /api/auth/refresh", () => {
        let refreshToken: string;
        let validUser: User;

        beforeEach(async () => {
            const { user, password } = await createTestUser(UserRole.MEMBER, "password123");
            validUser = user;

            const res = await app.request("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username, password: password }),
            });

            const setCookieHeader = res.headers.get("Set-Cookie") || "";

            const match = setCookieHeader.match(/refreshToken=([^;]+)/);
            if (match) {
                refreshToken = match[1];
            }
        });

        it("should issue a new access token with a valid refresh token", async () => {
            expect(refreshToken).toBeString();

            const res = await app.request("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Cookie": `refreshToken=${refreshToken}`
                }
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse<{ token: string }>;
            expect(body.data.token).toBeString();
        });

        it("should fail if refresh token is invalid", async () => {
            const res = await app.request("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Cookie": "refreshToken=this.is.an.invalid.token"
                }
            });

            expect(res.status).toBe(401);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error.code).toBe("REFRESH_TOKEN_INVALID");
        });

        it("should fail if refresh token cookie is missing", async () => {
            const res = await app.request("/api/auth/refresh", {
                method: "POST",
            });

            expect(res.status).toBe(401);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error.code).toBe("REFRESH_TOKEN_MISSING");
        });
    });

    describe('GET /api/auth/profile', () => {
        let testUser: any;
        let testToken: string;

        beforeEach(async () => {
            const { user } = await createTestUser(UserRole.MEMBER);
            testUser = user;
            testToken = await generateAuthToken({ id: user.id, username: user.username, name: user.name, role: UserRole.MEMBER });
        });

        it('should return user profile with valid token', async () => {
            const res = await app
                .request('/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${testToken}`,
                    },
                }
                )

            const body = await res.json() as ApiSuccessResponse<User>;

            expect(res.status).toBe(200);
            expect(body.data).toHaveProperty('id', testUser.id);
            expect(body.data).toHaveProperty('username', testUser.username);
            expect(body.data).toHaveProperty('name', testUser.name);
        });

        it('should return 401 for missing token', async () => {
            const res = await app
                .request('/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(401);
            expect(body.message).toBe('Unauthorized');
        });

        it('should return 401 for invalid token', async () => {
            const res = await app
                .request('/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer invalidtoken',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(401);
            expect(body.message).toBe('Invalid or expired token');
        });
    });

    describe("PUT /api/auth/change-password", () => {
        let testUser: any;
        let plainPassword = "password123";
        let userToken: string;

        beforeEach(async () => {
            const { user, password } = await createTestUser(UserRole.MEMBER, plainPassword);
            testUser = user;
            userToken = await generateAuthToken({ id: user.id, role: UserRole.MEMBER });
        });

        it("should allow a logged-in user to change their password", async () => {
            const newPassword = "new-strong-password-456";
            const res = await app.request("/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    currentPassword: plainPassword,
                    newPassword: newPassword,
                }),
            });

            expect(res.status).toBe(200);

            const loginWithNewPasswordRes = await app.request("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: testUser.username, password: newPassword }),
            });
            expect(loginWithNewPasswordRes.status).toBe(200);
        });

        it("should return 400 if the current password is incorrect", async () => {
            const res = await app.request("/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    currentPassword: "this-is-a-wrong-password",
                    newPassword: "any-new-password",
                }),
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error.code).toBe("INVALID_CURRENT_PASSWORD");
        });

        it("should return 422 if the new password is too short", async () => {
            const res = await app.request("/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    currentPassword: plainPassword,
                    newPassword: "short",
                }),
            });

            expect(res.status).toBe(422);
        });
    });

    describe('POST /api/auth/logout', () => {
        let testToken: string;

        beforeEach(async () => {
            const { user } = await createTestUser(UserRole.MEMBER);
            testToken = await generateAuthToken({ id: user.id, username: user.username, name: user.name, role: UserRole.MEMBER });
        });

        it('should logout user with valid token', async () => {
            const res = await app
                .request('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${testToken}`,
                    },
                })

            const body = await res.json() as ApiSuccessResponse<null>;

            expect(res.status).toBe(200);
            expect(body.message).toEqual('Logout successful');
            expect(body.data).toBeNull();
        });

        it('should return 401 for missing token', async () => {
            const res = await app
                .request('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            const body = await res.json() as ApiErrorResponse;

            expect(res.status).toBe(401);
            expect(body.message).toEqual('Unauthorized');
        });
    });
});

describe("Password Reset Flow", () => {
    let testUser: any;
    const userRepo = new UserRepository();

    beforeEach(async () => {
        const { user } = await createTestUser(UserRole.MEMBER);
        testUser = user;
    });

    describe("POST /api/auth/forgot-password", () => {
        it("should generate a reset token and mock-send an email for a valid user", async () => {
            const res = await app.request("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testUser.email }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toContain("a password reset link has been sent");

            const userInDb = await db.query.users.findFirst({ where: eq(users.id, testUser.id) });

            expect(userInDb?.passwordResetToken).toBeString();
            expect(userInDb?.passwordResetExpires).toBeInstanceOf(Date);
        });

        it("should return a generic success message even if the email does not exist", async () => {
            const res = await app.request("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "nonexistent@example.com" }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toContain("a password reset link has been sent");
        });
    });

    describe("POST /api/auth/reset-password", () => {
        let validResetToken: string;

        beforeEach(async () => {
            validResetToken = await userRepo.setPasswordResetToken(testUser.id);
        });

        it("should successfully reset the password with a valid token", async () => {
            const newPassword = "MyNewSecurePassword123";
            const res = await app.request("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: validResetToken,
                    newPassword: newPassword,
                }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as ApiSuccessResponse;
            expect(body.message).toBe("Password has been reset successfully.");

            const loginRes = await app.request("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: testUser.username, password: newPassword }),
            });
            expect(loginRes.status).toBe(200);

            const userInDb = await db.query.users.findFirst({ where: eq(users.id, testUser.id) });
            expect(userInDb?.passwordResetToken).toBeNull();
        });

        it("should fail if the reset token is invalid", async () => {
            const res = await app.request("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: "this-is-an-invalid-token",
                    newPassword: "any-password",
                }),
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error.code).toBe("INVALID_TOKEN");
        });

        it("should fail if the reset token has expired", async () => {
            const expiredDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
            await db
                .update(users)
                .set({ passwordResetExpires: expiredDate })
                .where(eq(users.id, testUser.id));

            const res = await app.request("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: validResetToken,
                    newPassword: "any-password",
                }),
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ApiErrorResponse;
            expect(body.error.code).toBe("INVALID_TOKEN");
        });
    });
});