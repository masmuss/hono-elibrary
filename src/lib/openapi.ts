import { Scalar } from "@scalar/hono-api-reference";

import packageJson from "../../package.json";
import { App } from "./types";

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
            url: "/doc",
        }),
    );
}