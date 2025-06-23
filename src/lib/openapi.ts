import { Scalar } from "@scalar/hono-api-reference";

import packageJson from "../../package.json";
import type { App } from "./types";

export default function openAPI(app: App) {
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			title: packageJson.name,
			version: packageJson.version,
			description: packageJson.description,
		},
	});

	app.get(
		"/reference",
		Scalar({
			layout: "classic",
			defaultHttpClient: {
				targetKey: "node",
				clientKey: "axios",
			},
			hideSearch: true,
			servers: [
				{
					url: "http://localhost:3000",
					description: "Local server",
				},
			],
			url: "/doc",
			authentication: {
				securitySchemes: {
					apiKeyHeader: {
						type: "apiKey",
						in: "header",
						name: "Authorization",
						description: "Bearer token for authentication",
					},
				},
			},
		}),
	);
}
