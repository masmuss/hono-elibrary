import envRuntime from "@/config/env-runtime";
import type { AppRouteHandler } from "@/lib/types";
import type {
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
		try {
			const body = c.req.valid("json");

			if (!body) {
				throw new Error("Invalid request body");
			}

			const user = await this.repository.register(body);

			if (!user) {
				return c.json(
					this.responseBuilder(
						null,
						"User with same username or email already exists",
					),
					409,
				);
			}

			return c.json(
				this.responseBuilder(user, "User registered successfully"),
				201,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to register user", error as Error),
				500,
			);
		}
	};

	login: AppRouteHandler<LoginRoute> = async (c) => {
		try {
			const body = c.req.valid("json");

			if (!body) {
				throw new Error("Invalid request body");
			}

			const user = await this.repository.login(body.username, body.password);

			if (!user) {
				return c.json(
					this.responseBuilder(null, "Invalid username or password"),
					401,
				);
			}

			const { id, name, username, role } = user;

			const token = await sign(
				{
					id: id,
					username: username,
					name: name,
					role: role.name,
				},
				envRuntime.JWT_SECRET,
			);

			c.set("user", id);
			c.set("session", token);

			return c.json(
				{
					data: {
						id,
						name,
						username,
						token,
					},
					message: "Login successful",
					error: null,
				},
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to login user", error as Error),
				500,
			);
		}
	};

	profile: AppRouteHandler<ProfileRoute> = async (c) => {
		try {
			const user = c.get("user");

			if (!user) {
				return c.json(this.responseBuilder(null, "User not found"));
			}

			return c.json(
				this.responseBuilder(
					{ data: user },
					"User profile retrieved successfully",
				),
				200,
			);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(
					null,
					"Failed to get user profile",
					error as Error,
				),
				500,
			);
		}
	};

	logout: AppRouteHandler<LogoutRoute> = async (c) => {
		try {
			c.set("user", null);
			c.set("session", null);

			return c.json(this.responseBuilder(null, "Logout successful"), 200);
		} catch (error: unknown) {
			return c.json(
				this.responseBuilder(null, "Failed to logout user", error as Error),
				500,
			);
		}
	};
}
