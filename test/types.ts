import { ZodError, ZodIssue } from "zod";

export type ApiSuccessResponse<T = any> = {
    message: string;
    data: T;
    error: null;
};

export type ApiPaginatedResponse<T = any> = {
    message: string;
    data: T[];
    total: number;
    totalPages: number;
    page: number;
    error: null;
};

export type ApiErrorResponse<T = any> = {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    },
    message?: string;
};