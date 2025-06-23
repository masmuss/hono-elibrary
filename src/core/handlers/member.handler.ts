import { BaseHandler } from "../base/base-handler";
import { MemberRepository } from "../repositories/member.repository";
import type { AppRouteHandler } from "@/lib/types";
import type { GetMyProfile, UpdateMyProfile } from "@/routes/member/member.routes";

export class MemberHandler extends BaseHandler {
    constructor() {
        super(new MemberRepository());
    }

    getProfile: AppRouteHandler<GetMyProfile> = async (c) => {
        try {
            const user = c.get("user");
            const profile = await this.repository.getProfileByUserId(user.id);

            if (!profile) {
                return c.json(this.responseBuilder(null, "Member profile not found"), 404);
            }

            return c.json(this.responseBuilder({ data: profile }, "Profile retrieved successfully"), 200);
        } catch (error) {
            return c.json(this.responseBuilder(null, "Failed to retrieve profile", error as Error), 500);
        }
    };

    updateProfile: AppRouteHandler<UpdateMyProfile> = async (c) => {
        try {
            const user = c.get("user");
            const body = c.req.valid("json");

            const updatedProfile = await this.repository.updateProfile(user.id, body);

            return c.json(this.responseBuilder(updatedProfile, "Profile updated successfully"));
        } catch (error) {
            return c.json(this.responseBuilder(null, "Failed to update profile", error as Error), 500);
        }
    };
}