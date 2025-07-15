import db from './index';
import * as schema from './schema';
import { UserRole } from '@/lib/constants/enums/user-roles.enum';

async function hashPassword(password: string) {
    const { randomUUID } = await import('node:crypto');
    const salt = randomUUID();
    const hashedPassword = await Bun.password.hash(password + salt);
    return { hashedPassword, salt };
}

async function main() {
    console.log('🌱 Seeding database...');

    console.log('🗑️ Clearing old data...');
    await db.delete(schema.loans);
    await db.delete(schema.members);
    await db.delete(schema.users);
    await db.delete(schema.roles);
    await db.delete(schema.categories);
    await db.delete(schema.books);

    console.log('Seeding roles...');
    const rolesToInsert = [
        { name: UserRole.ADMIN, description: 'Administrator role' },
        { name: UserRole.MEMBER, description: 'Member role' },
        { name: UserRole.LIBRARIAN, description: 'Librarian role' },
    ];
    await db.insert(schema.roles).values(rolesToInsert);
    const roles = await db.query.roles.findMany();
    const roleMap = new Map(roles.map(r => [r.name, r.id]));

    console.log('Seeding static users for load testing...');
    const usersToSeed = [
        {
            username: 'admin',
            password: 'securePassword123',
            role: UserRole.ADMIN,
            name: 'Admin User',
            email: 'admin.user@example.com'
        },
        {
            username: 'member',
            password: 'securePassword123',
            role: UserRole.MEMBER,
            name: 'Member User',
            email: 'member.user@example.com'
        },
        {
            username: 'librarian',
            password: 'securePassword123',
            role: UserRole.LIBRARIAN,
            name: 'Librarian User',
            email: 'librarian.user@example.com'
        }
    ];

    for (const userData of usersToSeed) {
        const { hashedPassword, salt } = await hashPassword(userData.password);
        const [user] = await db.insert(schema.users).values({
            name: userData.name,
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            salt: salt,
            roleId: (() => {
                const roleId = roleMap.get(userData.role);
                if (!roleId) {
                    throw new Error(`Role ID not found for role: ${userData.role}`);
                }
                return roleId;
            })(),
        }).returning();

        if (userData.role === UserRole.MEMBER) {
            await db.insert(schema.members).values({
                userId: user.id,
                phone: '081234567890',
                address: '123 Load Test Street'
            });
        }
    }

    console.log('✅ Database seeded successfully!');
}

main().catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
});