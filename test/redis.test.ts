import redisClient from "@/lib/redis";
import { describe, it, expect } from "bun:test";

describe("Redis Connection and Basic Operations", () => {
    const testKeys: string[] = [];

    it("should connect to the Redis server and respond to PING", async () => {
        const reply = await redisClient.ping('Hello Redis!');
        expect(reply).toBe("Hello Redis!");
    });

    it("should be able to SET a value and GET it back", async () => {
        const testKey = "test:user:1";
        const testValue = "John Doe";
        testKeys.push(testKey);

        await redisClient.set(testKey, testValue);

        const retrievedValue = await redisClient.get(testKey);

        expect(retrievedValue).toBe(testValue);
    });

    it("should set a value with an expiration and see it disappear", async () => {
        const testKey = "test:session:temp";
        const testValue = "this will expire soon";
        testKeys.push(testKey);

        await redisClient.set(testKey, testValue, "EX", 1);

        let valueExists = await redisClient.get(testKey);
        expect(valueExists).toBe(testValue);

        await new Promise((resolve) => setTimeout(resolve, 1100));

        const valueShouldBeGone = await redisClient.get(testKey);
        expect(valueShouldBeGone).toBeNull();
    });

    it("should be able to DELETE a key", async () => {
        const testKey = "test:data:to-delete";
        const testValue = "some data";
        testKeys.push(testKey);

        await redisClient.set(testKey, testValue);
        let valueExists = await redisClient.get(testKey);
        expect(valueExists).toBe(testValue);

        await redisClient.del(testKey);

        let valueShouldBeGone = await redisClient.get(testKey);
        expect(valueShouldBeGone).toBeNull();
    });

    it("should handle JSON objects by stringifying and parsing", async () => {
        const testKey = "test:product:123";
        const productObject = {
            id: 123,
            name: "Hono Book",
            price: 25,
            tags: ["api", "framework", "bun"],
        };
        testKeys.push(testKey);

        await redisClient.set(testKey, JSON.stringify(productObject));

        const retrievedString = await redisClient.get(testKey);
        expect(typeof retrievedString).toBe("string");

        const retrievedObject = JSON.parse(retrievedString!);

        expect(retrievedObject).toEqual(productObject);
    });
});