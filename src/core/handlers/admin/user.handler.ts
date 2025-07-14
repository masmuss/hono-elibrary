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
		const filter = c.req.valid("query");
		const db = c.get("dbWithLogger") || this.repository.db;
		const result = await this.repository.getAllUsers(filter, db);
		return c.json(
			this.buildSuccessResponse(result, "Users retrieved successfully"),
			200,
		);
	};

	createUser: AppRouteHandler<AdminCreateUser> = async (c) => {
		const body = c.req.valid("json");
		const db = c.get("dbWithLogger") || this.repository.db;
		const result = await this.repository.createUserByAdmin(body, db);
		return c.json(
			this.buildSuccessResponse(result, "User created successfully by admin"),
			201,
		);
	};

	getUserById: AppRouteHandler<AdminGetUserById> = async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("dbWithLogger") || this.repository.db;
		const result = await this.repository.byId(id, db);
		return c.json(
			this.buildSuccessResponse(result, "User retrieved successfully"),
			200,
		);
	};

	updateUser: AppRouteHandler<AdminUpdateUser> = async (c) => {
		const { id } = c.req.valid("param");
		const body = c.req.valid("json");
		const db = c.get("dbWithLogger") || this.repository.db;
		const result = await this.repository.updateUser(id, body, db);
		return c.json(
			this.buildSuccessResponse(result, "User updated successfully"),
			200,
		);
	};

	deleteUser: AppRouteHandler<AdminDeleteUser> = async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("dbWithLogger") || this.repository.db;
		await this.repository.softDelete(id, db);
		return c.json(
			this.buildSuccessResponse(null, "User deleted successfully"),
			200,
		);
	};
}
