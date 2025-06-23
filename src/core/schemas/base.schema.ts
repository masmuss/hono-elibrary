import { z } from "zod";

export const baseErrorResponseSchema = z.object({
	success: z.literal(false),
	error: z.object({
		code: z.string().openapi({
			description: "Kode error yang bisa dibaca mesin.",
			example: "USER_NOT_FOUND",
		}),
		message: z.string().openapi({
			description: "Pesan error yang bisa dibaca manusia.",
			example: "User not found",
		}),
		details: z.any().optional().openapi({
			description: "Informasi tambahan, biasanya untuk error validasi.",
		}),
	}),
});

export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
) =>
	z.object({
		data: dataSchema.nullable(),
		message: z.string().openapi({
			description: "Pesan yang mendeskripsikan hasil operasi.",
			example: "Users retrieved successfully",
		}),
		error: z.null(),
		total: z.number().int().optional(),
		totalPages: z.number().int().optional(),
		page: z.number().int().optional(),
	});
