import { z } from "@hono/zod-openapi";
import jsonContent from "@/core/helpers/json-content";

export class BaseRoutes {
    protected errorResponse = (schema: any, description: string) => jsonContent(schema, description);

    protected successResponse = (schema: any, description: string) => jsonContent(z.object({
        schema,
        message: z.string(),
        error: z.nullable(z.string()),
    }), description);
}