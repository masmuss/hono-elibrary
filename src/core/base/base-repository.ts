import type { InferSelectModel, SQL } from "drizzle-orm";
import type { PgSelect, PgTable } from "drizzle-orm/pg-core";
import { eq, isNull, or, sql } from "drizzle-orm";
import db from "@/db";

/**
 * BaseRepository provides a foundation for database operations, including:
 * - Filtering query results with specified conditions
 * - Full-text search across defined columns
 * - Pagination and ordering support
 */
export class BaseRepository {
  protected db;
  protected table: PgTable;
  protected orderOption: Record<string, SQL>;

  /**
   * Initializes a new instance of the BaseRepository.
   * @param table - The database table associated with this repository.
   * @param orderOption - A mapping of order keys to SQL expressions for ordering.
   */
  constructor(table: PgTable, orderOption: Record<string, SQL>) {
    this.db = db;
    this.table = table;
    this.orderOption = orderOption;
  }

  /**
   * Builds SQL conditions for filtering based on the provided filter object.
   * Excludes specified keys and additional default keys: "search", "page", "pageSize", "orderBy".
   * @param filter - The filter object containing key-value pairs to filter by.
   * @param exclude - Optional list of keys to exclude from the filter.
   * @returns An array of SQL conditions.
   */
  protected filterBuilder(
    filter: Partial<InferSelectModel<typeof this.table>>,
    exclude: string[] = []
  ): SQL[] {
    const conditions: SQL[] = [];
    const excludedKeys = new Set([
      ...exclude,
      "search",
      "page",
      "pageSize",
      "orderBy",
    ]);

    Object.entries(filter).forEach(([key, value]) => {
      if (!excludedKeys.has(key)) {
        const column = (this.table as any)[key];
        conditions.push(value === null ? isNull(column) : eq(column, value));
      }
    });

    return conditions;
  }

  /**
   * Builds a full-text search query for the specified columns.
   * Uses ILIKE for case-insensitive matching.
   * @param search - The search string.
   * @param columns - The columns to search within.
   * @returns An SQL OR condition for the search.
   */
  protected searchBuilder(
    search: string,
    columns: (keyof InferSelectModel<typeof this.table>)[]
  ): SQL {
    return or(
      ...columns.map((col) => {
        const column = (this.table as any)[col];
        return sql`${column} ILIKE ${`%${search}%`}`;
      })
    ) || sql`FALSE`;
  }

  /**
   * Executes a paginated query with optional ordering and where condition.
   * @param qb - The query builder instance.
   * @param orderByKey - The key to determine ordering (matches keys in orderOption).
   * @param whereCondition - Optional SQL condition to filter results.
   * @param page - The current page number (default is 1).
   * @param pageSize - The number of items per page (default is 10).
   * @returns The result data, total count, total pages, and current page.
   */
  protected async withPagination<T extends PgSelect>(
    qb: T,
    orderByKey?: string,
    whereCondition: SQL | null = null,
    page = 1,
    pageSize = 10
  ): Promise<{
    data: InferSelectModel<PgTable>[] | InferSelectModel<PgTable>;
    total: number;
    totalPages: number;
    page: number;
  }> {
    const totalQuery = this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(this.table)
      .where(whereCondition ?? sql`TRUE`);

    const total = Number((await totalQuery)[0].count);
    const totalPages = Math.ceil(total / pageSize);

    const orderByColumn = orderByKey && orderByKey !== "default"
      ? this.orderOption[orderByKey]
      : undefined;

    let query = orderByColumn ? qb.orderBy(orderByColumn) : qb;
    query = query.limit(pageSize).offset((page - 1) * pageSize);

    const data = await query;

    return {
      data,
      total,
      totalPages,
      page
    };
  }
}
