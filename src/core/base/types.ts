import type { InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export type PaginatedData = {
	data: InferSelectModel<PgTable>[] | InferSelectModel<PgTable>;
	total: number;
	totalPages: number;
	page: number;
};

type ObjectData = {
	data: InferSelectModel<PgTable> | null;
};

export type ResponseData = PaginatedData | ObjectData | null;
