import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().url().readonly(),
});

export type Environment = z.infer<typeof EnvSchema>;

export function parseEnv(data: Record<string, string>): Environment {
  const { data: env, error } = EnvSchema.safeParse(data);

  if (!error) return env;

  const errorMessage = `error: invalid env:\n${Object.entries(
    error.flatten().fieldErrors,
  )
    .map(([key, errors]) => `${key}: ${errors.join(", ")}`)
    .join("\n")}`;
  throw new Error(errorMessage);
}
