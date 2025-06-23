import type { members } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Member = InferSelectModel<typeof members>;

export type MemberProfileUpdate = {
    name?: string;
    phone?: string;
    address?: string;
};