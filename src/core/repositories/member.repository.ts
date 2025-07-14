import { BaseRepository } from "@/core/base/base-repository";
import db from "@/db";
import { members, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MemberProfileUpdate } from "../types/member";
import { APIError } from "../helpers/api-error";
import type { DbInstance } from "../types/db";

export class MemberRepository extends BaseRepository {
	constructor() {
		super(members, {});
	}

	async findByUserId(userId: string) {
		const [member] = await db
			.select()
			.from(this.table)
			.where(eq(members.userId, userId));

		if (!member) {
			throw new APIError(
				404,
				"Member profile not found for this user",
				"MEMBER_PROFILE_NOT_FOUND",
			);
		}
		return member;
	}

	async getProfileByUserId(userId: string, dbInstance: DbInstance) {
		const db = dbInstance || this.db;
		const memberProfile = await db.query.members.findFirst({
			where: eq(members.userId, userId),
			columns: {
				id: true,
				phone: true,
				address: true,
			},
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						username: true,
					},
				},
			},
		});

		if (!memberProfile) {
			throw new APIError(
				404,
				"Member profile not found",
				"MEMBER_PROFILE_NOT_FOUND",
			);
		}
		return memberProfile;
	}

	async updateProfile(
		userId: string,
		data: MemberProfileUpdate,
		dbInstance?: DbInstance,
	) {
		const db = dbInstance || this.db;
		return await db.transaction(async (trx) => {
			if (data.name) {
				await trx
					.update(users)
					.set({ name: data.name })
					.where(eq(users.id, userId));
			}

			if (data.phone || data.address) {
				const updateData: { phone?: string; address?: string } = {};
				if (data.phone) updateData.phone = data.phone;
				if (data.address) updateData.address = data.address;

				await trx
					.update(members)
					.set(updateData)
					.where(eq(members.userId, userId));
			}

			const updatedProfile = await this.getProfileByUserId(userId, trx);

			return { data: updatedProfile };
		});
	}
}
