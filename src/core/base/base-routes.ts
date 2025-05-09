import jsonContent from "@/core/helpers/json-content";
import { z } from "@hono/zod-openapi";
import type { ZodSchema } from "zod";

export class BaseRoutes {
	protected errorResponse = (schema: ZodSchema, description: string) =>
		jsonContent(schema, description);

	protected successResponse = (schema: ZodSchema, description: string) =>
		jsonContent(
			z.object({
				schema,
				message: z.string(),
				error: z.nullable(z.string()),
			}),
			description,
		);
}
