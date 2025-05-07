import type { Environment } from "@/env";

export interface AppBindings {
  Bindings: Environment;
  Variables: {
    user: any;
    session: any;
  };
}
