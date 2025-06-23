import { BaseRepository } from "@/core/base/base-repository";
import db from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export class MemberRepository extends BaseRepository {
	constructor() {
		super(members, {});
	}

	async findByUserId(userId: string) {
		const [member] = await db
			.select()
			.from(this.table)
			.where(eq(members.userId, userId));

		return member;
	}
}
