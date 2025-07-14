import { z } from "zod";
import { paginationQuerySchema } from "../helpers/schemas";

export const auditLogResponseSchema = z.object({
    id: z.string().uuid(),
    action: z.string(),
    status: z.string(),
    payload: z.any().nullable(),
    dbQuery: z.string().nullable(),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    createdAt: z.date(),
    user: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }).nullable(),
});

export const getAllAuditLogsSuccessResponse = z.object({
    data: z.array(auditLogResponseSchema),
    total: z.number().int(),
    totalPages: z.number().int(),
    page: z.number().int(),
});

export const getAllAuditLogsQuerySchema = paginationQuerySchema;