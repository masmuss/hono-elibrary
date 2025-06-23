import { z } from "@hono/zod-openapi";

const IdParamSchema = z.object({
	id: z.coerce.number().openapi({
		description: "Unique identifier for the resource",
		param: {
			name: "id",
			in: "path",
			required: true,
		},
		required: ["id"],
		example: 10,
	}),
});

export default IdParamSchema;
