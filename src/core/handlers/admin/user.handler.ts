import { BaseHandler } from "@/core/base/base-handler";
import { UserRepository } from "@/core/repositories/user.repository";
import type { AppRouteHandler } from "@/lib/types";
import type {
	AdminCreateUser,
	AdminDeleteUser,
	AdminGetAllUsers,
	AdminGetUserById,
	AdminUpdateUser,
} from "@/routes/admin/user.routes";

export class AdminUserHandler extends BaseHandler {
	constructor() {
		super(new UserRepository());
	}

	getAllUsers: AppRouteHandler<AdminGetAllUsers> = async (c) => {
		try {
			const filter = c.req.valid("query");
			const result = await this.repository.getAllUsers(filter);
			return c.json(
				this.responseBuilder(result, "Users retrieved successfully"),
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to retrieve users", error as Error),
				500,
			);
		}
	};

	createUser: AppRouteHandler<AdminCreateUser> = async (c) => {
		try {
			const body = c.req.valid("json");
			const result = await this.repository.createUserByAdmin(body);
			return c.json(
				this.responseBuilder(result, "User created successfully by admin"),
				201,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to create user", error as Error),
				400,
			);
		}
	};

	getUserById: AppRouteHandler<AdminGetUserById> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const result = await this.repository.byId(id);

			if (!result) {
				return c.json(this.responseBuilder(null, "User not found"), 404);
			}

			return c.json(
				this.responseBuilder(result, "User retrieved successfully"),
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to retrieve user", error as Error),
				500,
			);
		}
	};

	updateUser: AppRouteHandler<AdminUpdateUser> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");

			const result = await this.repository.updateUser(id, body);

			if (!result) {
				return c.json(this.responseBuilder(null, "User not found"), 404);
			}

			return c.json(this.responseBuilder(result, "User updated successfully"));
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to update user", error as Error),
				500,
			);
		}
	};

	deleteUser: AppRouteHandler<AdminDeleteUser> = async (c) => {
		try {
			const { id } = c.req.valid("param");
			const result = await this.repository.softDelete(id);

			if (!result) {
				return c.json(this.responseBuilder(null, "User not found"), 404);
			}

			return c.json(this.responseBuilder(null, "User deleted successfully"));
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to delete user", error as Error),
				500,
			);
		}
	};
}
