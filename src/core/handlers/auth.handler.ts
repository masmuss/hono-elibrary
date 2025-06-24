import type { AppRouteHandler } from "@/lib/types";
import type {
	ChangePasswordRoute,
	ForgotPasswordRoute,
	LoginRoute,
	LogoutRoute,
	ProfileRoute,
	RefreshTokenRoute,
	RegisterRoute,
	ResetPasswordRoute,
} from "@/routes/auth/auth.routes";
import { BaseHandler } from "../base/base-handler";
import { UserRepository } from "../repositories/user.repository";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "@/lib/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { APIError } from "../helpers/api-error";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { eq } from "drizzle-orm";
import db from "@/db";
import { users } from "@/db/schema";

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

		const accessToken: string = await generateAccessToken(user);
		const refreshToken: string = await generateRefreshToken(user);

		const responseData = { id, name, username, token: accessToken };

		await this.repository.updateRefreshToken(id, refreshToken);

		setCookie(c, "refreshToken", refreshToken, {
			httpOnly: true,
			secure: c.env.NODE_ENV === "production",
			sameSite: "Lax",
			path: "/",
			maxAge: 7 * 24 * 60 * 60,
		});

		return c.json(
			this.buildSuccessResponse({ data: responseData }, "Login successful"),
			200,
		);
	};

	refreshToken: AppRouteHandler<RefreshTokenRoute> = async (c) => {
		const tokenFromCookie = getCookie(c, "refreshToken");

		if (!tokenFromCookie) {
			throw new APIError(
				401,
				"Refresh token not found",
				"REFRESH_TOKEN_MISSING",
			);
		}

		const decoded = await verifyRefreshToken(tokenFromCookie);

		if (!decoded || !decoded.id) {
			throw new APIError(
				401,
				"Invalid refresh token payload",
				"REFRESH_TOKEN_INVALID",
			);
		}

		const user = await this.repository.byId(decoded.id);

		if (!user.data || user.data.refreshToken !== tokenFromCookie) {
			throw new APIError(
				401,
				"Refresh token has been revoked or is invalid",
				"REFRESH_TOKEN_REVOKED",
			);
		}

		const newAccessToken = await generateAccessToken({
			id: user.data.id,
			name: user.data.name,
			role: user.data.role.name,
		});

		return c.json(
			this.buildSuccessResponse(
				{ data: { token: newAccessToken } },
				"Token refreshed successfully",
			),
			200,
		);
	};

	forgotPassword: AppRouteHandler<ForgotPasswordRoute> = async (c) => {
		const { email } = c.req.valid("json");
		const user = await db.query.users.findFirst({ where: eq(users.email, email) });

		if (user) {
			const resetToken = await this.repository.setPasswordResetToken(user.id);
			await sendPasswordResetEmail(user.email, resetToken);
		}

		return c.json(
			this.buildSuccessResponse(
				null,
				"If an account with that email exists, a password reset link has been sent.",
			),
			200,
		);
	};

	resetPassword: AppRouteHandler<ResetPasswordRoute> = async (c) => {
		const { token, newPassword } = c.req.valid("json");
		await this.repository.resetPassword(token, newPassword);
		return c.json(
			this.buildSuccessResponse(null, "Password has been reset successfully."),
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
		const user = c.get("user");
		if (user) {
			await this.repository.updateRefreshToken(user.id, null);
		}

		setCookie(c, "refreshToken", "", { maxAge: 0 });
		return c.json(this.buildSuccessResponse(null, "Logout successful"), 200);
	};
}
