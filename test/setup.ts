import db from '@/db';
import * as schema from '@/db/schema';
import { UserRole } from '@/lib/constants/enums/user-roles.enum';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach } from 'bun:test'

async function clearDatabase() {
    try {
        await db.delete(schema.loans);
        await db.delete(schema.books);
        await db.delete(schema.members);
        await db.delete(schema.users);
        await db.delete(schema.categories);
        await db.delete(schema.roles);
    } catch (error) {
        throw error;
    }
}

async function seedRoles() {
    const rolesToInsert = [
        { name: UserRole.ADMIN, description: 'Administrator role' },
        { name: UserRole.MEMBER, description: 'Member role' },
        { name: UserRole.LIBRARIAN, description: 'Librarian role' },
    ];

    for (const role of rolesToInsert) {
        const existingRole = await db.query.roles.findFirst({ where: eq(schema.roles.name, role.name) });
        if (!existingRole) {
            await db.insert(schema.roles).values(role);
        }
    }
}

afterAll(async () => {
    await clearDatabase();
});

beforeEach(async () => {
    await clearDatabase();
    await seedRoles();
});

if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run in NODE_ENV=test. Please set NODE_ENV=test.');
}