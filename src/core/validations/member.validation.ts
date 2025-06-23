import { z } from "zod";

export const updateMemberProfileSchema = z.object({
    name: z.string().min(3).optional().openapi({
        description: "Member's full name",
        example: "John Doe Updated",
    }),
    phone: z.string().min(10).max(50).optional().openapi({
        description: "Member's phone number",
        example: "081234567890",
    }),
    address: z.string().min(10).optional().openapi({
        description: "Member's full address",
        example: "123 Main Street, Anytown",
    }),
}).partial();