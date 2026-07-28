import dotenv from "dotenv";
import { beforeAll, afterAll } from "vitest";

dotenv.config({
    path: ".env.test",
    override: true,
});

const {
    connectRedis,
    disconnectRedis,
    redisClient,
} = await import("../../../src/backend/redis.js");

if (!process.env.SESSION_SECRET) {
    throw new Error("Session secret is not configured.");
}

beforeAll(async () => {
    await connectRedis();
    await redisClient.flushDb();
});

afterAll(async () => {
    await redisClient.flushDb();
    await disconnectRedis();
});

