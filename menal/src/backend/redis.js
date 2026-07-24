import { createClient } from "redis";

const redisURL = process.env.REDIS_URL;

if (!redisURL) {
    throw new Error("REDIS_URL is not configured.");
}

export const redisClient = createClient({
    url: redisURL,
});

redisClient.on("connect", () => {
    console.log("Connecting to redis...");
});

redisClient.on("ready", () => {
    console.log("Redis is ready.");
});

redisClient.on("reconnecting", () => {
    console.log("Reconnecting to Redis.");
});

redisClient.on("error", (error) => {
    console.log("Redis error: ", error.message);
});

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}