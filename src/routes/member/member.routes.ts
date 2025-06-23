import { BaseRoutes } from "@/core/base/base-routes";
import { createRoute } from "@hono/zod-openapi";
import { authHeadersSchema } from "@/core/validations/auth.validation";
import { authMiddleware } from "@/middlewares/auth";
import { errorResponse } from "@/core/schemas/errors.schema";
import { getMemberProfileSuccessResponse } from "@/core/schemas/member.schema";
import { updateMemberProfileSchema } from "@/core/validations/member.validation";
import jsonContentRequired from "@/core/helpers/json-content-required";

export class MemberRoutes extends BaseRoutes {
    getProfile = createRoute({
        tags: ["Member"],
        description: "Get the profile of the currently logged-in member",
        path: "/profile",
        method: "get",
        request: {
            headers: authHeadersSchema,
        },
        middleware: [authMiddleware],
        responses: {
            200: this.successResponse(getMemberProfileSuccessResponse, "OK"),
            401: this.errorResponse(errorResponse, "Unauthorized"),
            404: this.errorResponse(errorResponse, "Profile Not Found"),
            500: this.errorResponse(errorResponse, "Internal Server Error"),
        },
    });

    updateProfile = createRoute({
        tags: ["Member"],
        description: "Update the profile of the currently logged-in member",
        path: "/profile",
        method: "put",
        request: {
            headers: authHeadersSchema,
            body: jsonContentRequired(updateMemberProfileSchema, "Profile update payload"),
        },
        middleware: [authMiddleware],
        responses: {
            200: this.successResponse(getMemberProfileSuccessResponse, "OK"),
            401: this.errorResponse(errorResponse, "Unauthorized"),
            422: this.errorResponse(errorResponse, "Validation Error"),
            500: this.errorResponse(errorResponse, "Internal Server Error"),
        },
    });
}

export type GetMyProfile = typeof MemberRoutes.prototype.getProfile;
export type UpdateMyProfile = typeof MemberRoutes.prototype.updateProfile;