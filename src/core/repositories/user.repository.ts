import { roles, users } from "@/db/schema";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { randomUUIDv7 } from "bun";
import { desc, eq, or } from "drizzle-orm";
import { BaseRepository } from "../base/base-repository";
import type { Register } from "../types/auth";
import type { User } from "../types/user";

export class UserRepository extends BaseRepository {
	constructor() {
		super(users, {
			latest: desc(users.createdAt),
		});
	}

	private async isUserExists(
		username: string,
		email: string,
	): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: (users_1) =>
				or(eq(users_1.username, username), eq(users_1.email, email)),
		});
		return user ?? null;
	}

	async register(data: Register): Promise<{ data: Register } | null> {
		const isExists = await this.isUserExists(data.username, data.email);
		const role = await this.db.query.roles.findFirst({
			where: eq(roles.name, UserRole.MEMBER),
		});

		if (isExists || !role) return null;

		const salt = randomUUIDv7();
		const user = await this.db
			.insert(users)
			.values({
				...data,
				password: await Bun.password.hash(data.password + salt),
				roleId: role.id,
				salt,
			})
			.returning();

		return {
			data: {
				name: user[0].name,
				username: user[0].username,
				email: user[0].email,
			},
		} as { data: Register };
	}

	async login(username: string, password: string): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: eq(users.username, username),
			with: {
				role: true,
			},
		});

		if (!user) return null;

		const isValid = await Bun.password.verify(
			password + user.salt,
			user.password,
		);

		if (!isValid) return null;

		return user;
	}
}
