export class APIError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string | undefined;

	constructor(statusCode: number, message: string, errorCode?: string) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		Object.setPrototypeOf(this, APIError.prototype);
	}
}
