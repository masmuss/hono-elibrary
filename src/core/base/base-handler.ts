import type { ResponseData } from "./types";

export class BaseHandler {
	protected repository;

	constructor(repository: any) {
		this.repository = repository;
	}

	protected buildSuccessResponse(result: ResponseData | null, message: string) {
		if (!result) {
			return {
				data: null,
				message,
				error: null,
			};
		}

		if ("total" in result && "totalPages" in result) {
			return {
				data: result.data,
				total: result.total,
				totalPages: result.totalPages,
				page: result.page,
				message,
				error: null,
			};
		}

		return {
			data: result.data,
			message,
			error: null,
		};
	}
}
