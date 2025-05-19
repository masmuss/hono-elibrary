import type { ResponseData } from "../base/types";

export interface Repository<T = ResponseData> {
	get(filter: unknown): Promise<T>;
	byId(id: string | number): Promise<T | null>;
	create(data: unknown): Promise<T>;
	update(id: string | number, data: unknown): Promise<T | null>;
	softDelete(id: string | number): Promise<T | null>;
	restore(id: string | number): Promise<T | null>;
	hardDelete(id: string | number): Promise<T | null>;
}
