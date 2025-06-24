import envRuntime from "@/config/env-runtime";
import { APIError } from "@/core/helpers/api-error";
import { sign, verify } from "hono/jwt";

type AccessTokenPayload = {
	id: string;
	role: string;
	name: string;
};

type RefreshTokenPayload = {
	id: string;
	version?: number;
};

const JWT_SECRET = envRuntime.JWT_SECRET;

export const generateAccessToken = (user: AccessTokenPayload) => {
	return sign(
		{ ...user, exp: Math.floor(Date.now() / 1000) + 15 * 60 },
		JWT_SECRET,
	);
};

export const generateRefreshToken = (user: RefreshTokenPayload) => {
	return sign(
		{ ...user, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
		JWT_SECRET,
	);
};

export const verifyRefreshToken = async (
	token: string,
): Promise<RefreshTokenPayload> => {
	try {
		const decoded = await verify(token, JWT_SECRET);
		return decoded as RefreshTokenPayload;
	} catch (error) {
		throw new APIError(
			401,
			"Invalid or expired refresh token",
			"REFRESH_TOKEN_INVALID",
		);
	}
};
