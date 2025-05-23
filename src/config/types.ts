import { z } from "zod";

export const EnvSchema = z.object({
	NODE_ENV: z.string().default("development"),
	DATABASE_URL: z.string().url().readonly(),
	JWT_SECRET: z.string().min(10).readonly(),
});

export type Environment = z.infer<typeof EnvSchema>;
export type ParseEnvParams = Record<string, string | undefined>;
