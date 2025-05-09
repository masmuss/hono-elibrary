import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

const onError: ErrorHandler = (err, c) => {
	const currentStatus =
		"status" in err ? err.status : c.newResponse(null).status;
	const statusCode =
		currentStatus !== 200 ? (currentStatus as StatusCode) : 500;
	const env = c.env?.NODE_ENV || process.env?.NODE_ENV;
	return c.json(
		{
			message: err.message,

			stack: env === "production" ? undefined : err.stack,
		},
		statusCode as ContentfulStatusCode,
	);
};

export default onError;
