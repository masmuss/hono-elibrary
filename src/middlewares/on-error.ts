import { APIError } from "@/core/helpers/api-error";
import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

const createErrorResponse = (
	statusCode: number,
	message: string,
	code?: string,
	details?: any,
) => {
	return {
		success: false,
		error: {
			code: code || `E${statusCode}`,
			message,
			details,
		},
	};
};

const onError: ErrorHandler = (err, c) => {
	if (err instanceof APIError) {
		return c.json(
			createErrorResponse(err.statusCode, err.message, err.errorCode),
			err.statusCode as any,
		);
	}

	if (err instanceof ZodError) {
		return c.json(
			createErrorResponse(
				422,
				"Validation failed",
				"VALIDATION_ERROR",
				err.flatten().fieldErrors,
			),
			422,
		);
	}

	console.error("Unhandled Error:", err);
	const message =
		c.env.NODE_ENV === "production"
			? "An unexpected error occurred."
			: err.message;

	return c.json(
		createErrorResponse(500, message, "INTERNAL_SERVER_ERROR"),
		500,
	);
};

export default onError;
