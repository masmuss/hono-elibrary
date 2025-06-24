import envRuntime from "@/config/env-runtime";
import type { AppRouteHandler } from "@/lib/types";
import type {
	ChangePasswordRoute,
	LoginRoute,
	LogoutRoute,
	ProfileRoute,
	RegisterRoute,
} from "@/routes/auth/auth.routes";
import { sign } from "hono/jwt";
import { BaseHandler } from "../base/base-handler";
import { UserRepository } from "../repositories/user.repository";

export class AuthHandler extends BaseHandler {
	constructor() {
		super(new UserRepository());
	}

	register: AppRouteHandler<RegisterRoute> = async (c) => {
		const body = c.req.valid("json");
		const user = await this.repository.register(body);
		return c.json(
			this.buildSuccessResponse(user, "User registered successfully"),
			201,
		);
	};

	login: AppRouteHandler<LoginRoute> = async (c) => {
		const body = c.req.valid("json");
		const user = await this.repository.login(body.username, body.password);

		const { id, name, username, role } = user;

		const token = await sign(
			{ id, username, name, role: role.name },
			envRuntime.JWT_SECRET,
		);

		const responseData = { id, name, username, token };

		return c.json(
			this.buildSuccessResponse({ data: responseData }, "Login successful"),
			200,
		);
	};

	profile: AppRouteHandler<ProfileRoute> = async (c) => {
		const user = c.get("user");
		return c.json(
			this.buildSuccessResponse(
				{ data: user },
				"User profile retrieved successfully",
			),
			200,
		);
	};

	changePassword: AppRouteHandler<ChangePasswordRoute> = async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");

		await this.repository.changePassword(
			user.id,
			body.currentPassword,
			body.newPassword,
		);

		return c.json(
			this.buildSuccessResponse(null, "Password updated successfully"),
			200,
		);
	};

	logout: AppRouteHandler<LogoutRoute> = async (c) => {
		c.set("user", null);
		return c.json(this.buildSuccessResponse(null, "Logout successful"), 200);
	};
}
