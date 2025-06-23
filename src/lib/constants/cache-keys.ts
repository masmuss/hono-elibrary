export const CacheKeys = {
	CATEGORIES: {
		PAGINATED: (page: number, pageSize: number) =>
			`categories:paginated:page:${page}:size:${pageSize}`,
		BY_ID: (id: number) => `categories:id:${id}`,
		ALL_KEYS_PATTERN: "categories:paginated:*",
	},
	BOOKS: {
		BY_ID: (id: number) => `book:id:${id}`,
		PAGINATED: (page: number, pageSize: number) =>
			`books:paginated:page:${page}:size:${pageSize}`,
		ALL_KEYS_PATTERN: "books:paginated:*",
	},
};
