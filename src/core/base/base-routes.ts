import jsonContent from "@/core/helpers/json-content";
import {
	baseErrorResponseSchema,
	createSuccessResponseSchema,
} from "../schemas/base.schema";
import type { ZodSchema } from "zod";

export class BaseRoutes {
	protected errorResponse(description: string) {
		return jsonContent(baseErrorResponseSchema, description);
	}

	protected successResponse(schema: ZodSchema, description: string) {
		const wrappedSchema = createSuccessResponseSchema(schema);
		return jsonContent(wrappedSchema, description);
	}
}
