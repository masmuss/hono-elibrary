import envRuntime from "@/config/env-runtime";
import Redis from "ioredis";

const redisClient = new Redis(envRuntime.REDIS_URL, {
	retryStrategy(times) {
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	enableOfflineQueue: true,
	maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
	console.log("✅ Connected to Redis successfully! (using ioredis)");
});

redisClient.on("error", (error) => {
	console.error("❌ Could not connect to Redis (ioredis):", error.message);
});

export default redisClient;