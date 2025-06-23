import envRuntime from "@/config/env-runtime";
import { RedisClient } from "bun";

const redisClient = new RedisClient(envRuntime.REDIS_URL, {
	autoReconnect: true,
	maxRetries: 5,
	enableOfflineQueue: true,
});

redisClient
	.connect()
	.then(() => {
		console.log(
			"✅ Connected to Redis successfully! (using Bun's native client)",
		);
	})
	.catch((error: Error) => {
		console.error("❌ Could not connect to Redis:", error.message);
	});

export default redisClient;
