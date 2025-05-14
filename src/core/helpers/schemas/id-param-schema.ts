import { z } from "@hono/zod-openapi";

const IdParamSchema = z.object({
	id: z.coerce.number().openapi({
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
