import { users, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '@/lib/constants/enums/user-roles.enum';
import db from '@/db';

import { describe, beforeAll, it, expect, beforeEach } from 'bun:test'
import app from '@/index';
import { createTestUser } from './utils/data-helpers';
import { generateAuthToken } from './utils/auth-helpers';


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

            const result = await res.json();

            expect(res.status).toBe(201);
            expect(result).toEqual({
                message: 'User registered successfully',
                data: {
                    name: userData.name,
                    username: userData.username,
                    email: userData.email,
                },
                error: null,
            });
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

            expect(res.status).toBe(409);
            expect(await res.json()).toEqual({
                message: 'User with same username or email already exists',
                data: null,
                error: null
            })
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

            expect(res.status).toBe(409);
            expect(await res.json()).toEqual({
                message: 'User with same username or email already exists',
                data: null,
                error: null
            })
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

            expect(res.status).toBe(422);
            expect(await res.json()).toEqual({
                success: false,
                errors: expect.any(Array),
            })
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

            expect(res.status).toBe(200);
            expect(await res.json()).toEqual({
                message: 'Login successful',
                error: null,
                data: {
                    id: testUser.id,
                    name: testUser.name,
                    username: testUser.username,
                    token: expect.any(String),
                },
            })
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

            expect(res.status).toBe(401);
            expect(await res.json()).toEqual({
                message: 'Invalid username or password',
                data: null,
                error: null,
            })
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

            expect(res.status).toBe(401);
            expect(await res.json()).toHaveProperty('message', 'Invalid username or password');
        });
    });

    describe('GET /api/auth/profile', () => {
        let testUser: any;
        let testToken: string;

        beforeEach(async () => {
            const { user, password } = await createTestUser(UserRole.MEMBER);
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

            expect(res.status).toBe(200);
            expect(await res.json()).toEqual({
                message: "User profile retrieved successfully",
                error: null,
                data: {
                    id: testUser.id,
                    username: testUser.username,
                    name: testUser.name,
                    role: UserRole.MEMBER,
                }
            })
        });

        it('should return 401 for missing token', async () => {
            const res = await app
                .request('/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            expect(res.status).toBe(401);
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

            expect(res.status).toBe(401);
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

            expect(res.status).toBe(200);
            expect(await res.json()).toEqual({
                message: 'Logout successful',
                error: null,
                data: null,
            })
        });

        it('should return 401 for missing token', async () => {
            const res = await app
                .request('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            expect(res.status).toBe(401);
            expect(await res.json()).toEqual({
                message: 'Unauthorized',
            });
        });
    });
});