import type { User } from "./user";

export type Register = Pick<User, "name" | "username" | "email" | "password">;
export type Login = Pick<User, "username" | "password">;
