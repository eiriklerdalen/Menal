import { createTestDatabase } from "./createTestDatabase";
import { redisClient } from "../../../backend/redis";
import { createApp } from "../../../../src/backend/app.js";
import { createRateLimiters } from "../../../backend/security/rateLimiters";

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