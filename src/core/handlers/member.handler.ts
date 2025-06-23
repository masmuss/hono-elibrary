import { BaseHandler } from "../base/base-handler";
import { MemberRepository } from "../repositories/member.repository";
import type { AppRouteHandler } from "@/lib/types";
import type {
	GetMyProfile,
	UpdateMyProfile,
} from "@/routes/member/member.routes";

export class MemberHandler extends BaseHandler {
	constructor() {
		super(new MemberRepository());
	}

	getProfile: AppRouteHandler<GetMyProfile> = async (c) => {
		const user = c.get("user");
		const profile = await this.repository.getProfileByUserId(user.id);
		return c.json(
			this.buildSuccessResponse(
				{ data: profile },
				"Profile retrieved successfully",
			),
			200,
		);
	};

	updateProfile: AppRouteHandler<UpdateMyProfile> = async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");
		const updatedProfile = await this.repository.updateProfile(user.id, body);
		return c.json(
			this.buildSuccessResponse(updatedProfile, "Profile updated successfully"),
			200,
		);
	};
}
