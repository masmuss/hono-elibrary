import { createRouter } from "@/lib/app";

const router = createRouter();

router.get("/", async (c) => {
	return c.json({ message: "Hello World!" }, 200);
});

export default router;
