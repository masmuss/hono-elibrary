import { sign } from 'hono/jwt';
import { randomUUIDv7 } from 'bun';
import envRuntime from '@/config/env-runtime';

export async function hashPassword(password: string) {
    const salt = randomUUIDv7();
    const hashedPassword = await Bun.password.hash(password + salt);
    return { hashedPassword, salt };
}

export async function generateAuthToken(userPayload: any) {
    return await sign(userPayload, envRuntime.JWT_SECRET);
}