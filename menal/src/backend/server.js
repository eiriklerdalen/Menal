import "dotenv/config";

import Database from "better-sqlite3";

import { createApp } from "./app.js";
import { connectRedis, redisClient } from "./redis.js";
import { createRateLimiters } from "./security/rateLimiters.js"

const PORT = process.env.PORT ?? 3000;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
    throw new Error("Session secret is not configured.");
}

await connectRedis();
const db = new Database("./src/backend/menal.db");
const limiters = createRateLimiters(redisClient);

const app = createApp({
    db,
    redisClient,
    sessionSecret: process.env.SESSION_SECRET,
    isProduction,
    limiters,
})


// RUN
app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://10.0.0.81:3000");
});