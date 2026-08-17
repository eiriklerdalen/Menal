import "dotenv/config";

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createApp } from "./app.js";
import { connectRedis, redisClient } from "./redis.js";
import { createRateLimiters } from "./security/rateLimiters.js";
import { initializeDatabase } from "./setup.js";

const PORT = process.env.PORT ?? 3000;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
    throw new Error("Session secret is not configured.");
}

if (isProduction && process.env.SESSION_SECRET.length < 32) {
    throw new Error("Session secret must be at least 32 characters in production.");
}

await connectRedis();
const databasePath = process.env.DATABASE_PATH ?? "./src/backend/menal.db";
mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
initializeDatabase(db);

const limiters = createRateLimiters(redisClient);
const staticDir = fileURLToPath(new URL("../../dist", import.meta.url));

const app = createApp({
    db,
    redisClient,
    sessionSecret: process.env.SESSION_SECRET,
    isProduction,
    limiters,
    apiPrefix: "/api",
    staticDir,
});


// RUN
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
