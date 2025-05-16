import { EnvSchema, type Environment, type ParseEnvParams } from "./types";

export function parseEnv(data: ParseEnvParams): Environment {
	const { data: env, error } = EnvSchema.safeParse(data);

	if (!error) return env;

	const errorMessage = `error: invalid env:\n${Object.entries(
		error.flatten().fieldErrors,
	)
		.map(([key, errors]) => `${key}: ${errors.join(", ")}`)
		.join("\n")}`;
	throw new Error(errorMessage);
}
