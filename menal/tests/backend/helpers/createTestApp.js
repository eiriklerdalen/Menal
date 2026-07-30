import { createTestDatabase } from "./createTestDatabase.js";
import { redisClient } from "../../../src/backend/redis.js";
import { createApp } from "../../../src/backend/app.js";
import { createRateLimiters } from "../../../src/backend/security/rateLimiters.js";

export function createTestApp() {
    const db = createTestDatabase();
    const limiters = createRateLimiters(redisClient);

    const app = createApp({
        db,
        redisClient,
        sessionSecret: process.env.SESSION_SECRET,
        isProduction: false,
        limiters,
    });

    return { app, db };
}