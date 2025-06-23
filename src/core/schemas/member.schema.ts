import { z } from "zod";

export const memberProfileResponseSchema = z.object({
    id: z.string().uuid(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    user: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
        username: z.string(),
    }),
});

export const getMemberProfileSuccessResponse = z.object({
    data: memberProfileResponseSchema,
});