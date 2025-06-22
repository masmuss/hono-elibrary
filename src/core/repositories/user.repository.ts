import { roles, users } from "@/db/schema";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { randomUUIDv7 } from "bun";
import { desc, eq, or } from "drizzle-orm";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Register } from "../types/auth";
import type { User, UserInsert, UserUpdate } from "../types/user";
import type { Filter } from "./types";

export class UserRepository extends SoftDeleteMixin {
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

	async getAllUsers(filter: Filter) {
		const query = this.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				createdAt: users.createdAt,
				role: roles.name,
			})
			.from(this.table)
			.leftJoin(roles, eq(users.roleId, roles.id));

		return await this.withPagination(
			query.$dynamic(),
			filter.orderBy,
			undefined,
			filter.page,
			filter.pageSize,
		);
	}

	async createUserByAdmin(data: UserInsert) {
		const isExists = await this.isUserExists(data.username, data.email);
		if (isExists) {
			throw new Error("User with same username or email already exists");
		}

		const salt = randomUUIDv7();
		const [newUser] = await this.db
			.insert(users)
			.values({
				...data,
				password: await Bun.password.hash(data.password + salt),
				salt,
			})
			.returning({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
			});

		return { data: newUser };
	}

	async byId(id: string): Promise<{ data: any } | null> {
		const user = await this.db.query.users.findFirst({
			where: eq(users.id, id),
			with: {
				role: {
					columns: {
						name: true,
					},
				},
			},
			columns: {
				password: false,
				salt: false,
			},
		});

		if (!user) return null;
		return { data: user };
	}

	async updateUser(
		id: string,
		data: UserUpdate,
	): Promise<{ data: User } | null> {
		if (data.password) {
			const salt = randomUUIDv7();
			const hashedPassword = await Bun.password.hash(data.password + salt);
			data.password = hashedPassword;
			data.salt = salt;
		}

		const [updatedUser] = await this.db
			.update(users)
			.set(data)
			.where(eq(users.id, id))
			.returning();

		if (!updatedUser) return null;

		return { data: updatedUser };
	}
}
