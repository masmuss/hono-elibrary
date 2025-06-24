import { z } from "zod";

export const EnvSchema = z.object({
	NODE_ENV: z.string().default("development").readonly(),
	POSTGRES_HOST: z.string().readonly(),
	POSTGRES_DB: z.string().readonly(),
	POSTGRES_USER: z.string().readonly(),
	POSTGRES_PASSWORD: z.string().readonly(),
	POSTGRES_PORT: z.string().default("5432").readonly(),
	JWT_SECRET: z.string().min(10).readonly(),
	REDIS_URL: z.string().url().default("redis://localhost:6379").readonly(),
	SMTP_HOST: z.string().default("localhost").readonly(),
	SMTP_PORT: z.string().default("587").readonly(),
	SMTP_USER: z.string().default("user").readonly(),
	SMTP_PASS: z.string().default("password").readonly(),
	EMAIL_FROM: z.string().default("E-Library <no-reply@elibrary.com>").readonly(),
});

export type Environment = z.infer<typeof EnvSchema>;
export type ParseEnvParams = Record<string, string | undefined>;
