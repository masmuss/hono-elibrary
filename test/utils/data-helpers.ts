import { faker } from '@faker-js/faker';
import { UserRole } from '@/lib/constants/enums/user-roles.enum';
import db from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { LoanStatus } from '@/lib/constants/enums/loan-status.enum';
import { hashPassword } from './auth-helpers';

type RoleName = UserRole;

export async function createTestUser(roleName: RoleName = UserRole.MEMBER, password?: string) {
    const role = await db.query.roles.findFirst({ where: eq(schema.roles.name, roleName) });
    if (!role) {
        throw new Error(`Role ${roleName} not found. Ensure roles are seeded.`);
    }

    if (!password) {
        password = faker.internet.password({ length: 12 });
    }

    const { hashedPassword, salt } = await hashPassword(password);

    const newUser = {
        name: faker.person.fullName(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        salt: salt,
        roleId: role.id,
    };

    const [user] = await db.insert(schema.users).values(newUser).returning();
    return { user, password }; // Mengembalikan password mentah untuk login di tes
}

export async function createTestCategory() {
    const newCategory = {
        name: faker.lorem.words(2),
    };
    const [category] = await db.insert(schema.categories).values(newCategory).returning();
    return category;
}

export async function createTestBook(categoryId?: number) {
    const category = categoryId ? await db.query.categories.findFirst({ where: eq(schema.categories.id, categoryId) }) : await createTestCategory();
    if (!category) {
        throw new Error('Failed to create or find test category.');
    }

    const newBook = {
        isbn: faker.string.numeric(13),
        title: faker.lorem.words(3),
        synopsis: faker.lorem.paragraph(),
        author: faker.person.fullName(),
        publisher: faker.company.name(),
        totalPages: faker.number.int({ min: 50, max: 1000 }),
        publicationYear: faker.number.int({ min: 1900, max: new Date().getFullYear() }),
        totalCopies: faker.number.int({ min: 1, max: 10 }),
        availableCopies: faker.number.int({ min: 1, max: 10 }),
        categoryId: category.id,
    };

    const [book] = await db.insert(schema.books).values(newBook).returning();
    return book;
}

export async function createTestMember(userId?: string) {
    const user = userId ? await db.query.users.findFirst({ where: eq(schema.users.id, userId) }) : (await createTestUser(UserRole.MEMBER)).user;
    if (!user) {
        throw new Error('Failed to create or find test user for member.');
    }

    const newMember = {
        userId: user.id,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
    };
    const [member] = await db.insert(schema.members).values(newMember).returning();
    return member;
}

export async function createTestLoan(
    memberId: string,
    bookId: number,
    status: LoanStatus = LoanStatus.PENDING,
    librarianId?: string
) {
    const now = new Date();
    const newLoan = {
        memberId: memberId,
        bookId: bookId,
        loanDate: now,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: status,
        librarianId: librarianId,
    };
    const [loan] = await db.insert(schema.loans).values(newLoan).returning();
    return loan;
}