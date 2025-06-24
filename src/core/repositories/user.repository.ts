import { roles, users } from "@/db/schema";
import { UserRole } from "@/lib/constants/enums/user-roles.enum";
import { randomUUIDv7 } from "bun";
import { desc, eq, or } from "drizzle-orm";
import { SoftDeleteMixin } from "../mixins/soft-delete.mixin";
import type { Register } from "../types/auth";
import type { User, UserInsert, UserUpdate } from "../types/user";
import type { Filter } from "./types";
import { APIError } from "../helpers/api-error";

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

	async register(
		data: Register,
	): Promise<{ data: Omit<User, "password" | "salt"> }> {
		const isExists = await this.isUserExists(data.username, data.email);
		if (isExists) {
			throw new APIError(
				409,
				"User with same username or email already exists",
				"USER_ALREADY_EXISTS",
			);
		}

		const role = await this.db.query.roles.findFirst({
			where: eq(roles.name, UserRole.MEMBER),
		});

		if (!role) {
			throw new APIError(
				500,
				"Default role for registration not configured",
				"DEFAULT_ROLE_MISSING",
			);
		}

		const salt = randomUUIDv7();
		const [user] = await this.db
			.insert(users)
			.values({
				...data,
				password: await Bun.password.hash(data.password + salt),
				roleId: role.id,
				salt,
			})
			.returning();

		const { password, salt: removedSalt, ...restOfUser } = user;
		return { data: restOfUser };
	}

	async login(username: string, password_param: string): Promise<User> {
		const user = await this.db.query.users.findFirst({
			where: eq(users.username, username),
			with: {
				role: true,
			},
		});

		if (!user) {
			throw new APIError(
				401,
				"Invalid username or password",
				"INVALID_CREDENTIALS",
			);
		}

		const isValid = await Bun.password.verify(
			password_param + user.salt,
			user.password,
		);

		if (!isValid) {
			throw new APIError(
				401,
				"Invalid username or password",
				"INVALID_CREDENTIALS",
			);
		}

		return user;
	}

	async changePassword(
		userId: string,
		currentPassword_param: string,
		newPassword_param: string,
	): Promise<boolean> {
		const user = await this.db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new APIError(404, "User not found", "USER_NOT_FOUND");
		}

		const isCurrentPasswordValid = await Bun.password.verify(
			currentPassword_param + user.salt,
			user.password,
		);

		if (!isCurrentPasswordValid) {
			throw new APIError(400, "The current password you entered is incorrect.", "INVALID_CURRENT_PASSWORD");
		}

		const newSalt = randomUUIDv7();
		const newHashedPassword = await Bun.password.hash(newPassword_param + newSalt);

		await this.db
			.update(users)
			.set({
				password: newHashedPassword,
				salt: newSalt,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return true;
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

	async createUserByAdmin(
		data: UserInsert,
	): Promise<{ data: Omit<User, "password" | "salt"> }> {
		const isExists = await this.isUserExists(data.username, data.email);
		if (isExists) {
			throw new APIError(
				400,
				"User with same username or email already exists",
				"USER_ALREADY_EXISTS",
			);
		}

		const salt = randomUUIDv7();
		const [newUser] = await this.db
			.insert(users)
			.values({
				...data,
				password: await Bun.password.hash(data.password + salt),
				salt,
			})
			.returning();

		const { password, salt: removedSalt, ...restOfUser } = newUser;
		return { data: restOfUser };
	}

	async updateUser(id: string, data: UserUpdate): Promise<{ data: User }> {
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

		if (!updatedUser) {
			throw new APIError(404, "User not found to update", "USER_NOT_FOUND");
		}

		return { data: updatedUser };
	}

	async byId(id: string): Promise<{ data: any }> {
		const user = await this.db.query.users.findFirst({
			where: eq(users.id, id),
			with: { role: { columns: { name: true } } },
			columns: { password: false, salt: false },
		});

		if (!user) {
			throw new APIError(404, "User not found", "USER_NOT_FOUND");
		}
		return { data: user };
	}

	async softDelete(id: string): Promise<{ data: User }> {
		const [deletedUser] = await this.db
			.update(users)
			.set({ deletedAt: new Date() })
			.where(eq(users.id, id))
			.returning();

		if (!deletedUser) {
			throw new APIError(404, "User not found to delete", "USER_NOT_FOUND");
		}
		return { data: deletedUser };
	}
}
