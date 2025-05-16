import type { ResponseData } from "../base/types";

export interface Repository<T = ResponseData> {
	get(filter: unknown): Promise<T>;
	byId(id: string | number): Promise<T | null>;
	create(data: unknown): Promise<T>;
}
