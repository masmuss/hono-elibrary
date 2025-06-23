import type { Hook } from "@hono/zod-openapi";

const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return c.json(
			{
				success: result.success,
				error: {
					code: "VALIDATION_ERROR",
					message: "The provided data is invalid.",
					details: result.error.flatten().fieldErrors,
				},
			},
			422,
		);
	}
};

export default defaultHook;
