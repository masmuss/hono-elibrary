import type { NotFoundHandler } from "hono";

const notFound: NotFoundHandler = (c) => {
	return c.json(
		{
			message: `Not Found - ${c.req.path}`,
		},
		404,
	);
};

export default notFound;
