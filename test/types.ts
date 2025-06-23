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
    message: string;
    data: null;
    error?: string;
    errors: ZodIssue[];
};