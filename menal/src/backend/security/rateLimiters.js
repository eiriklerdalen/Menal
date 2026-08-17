import { rateLimit, MINUTE } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../redis.js";

export function createRateLimiters(redisClient) {

    function createRateLimitStore(prefix) {
        return new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix,
        });
    }

    const apiLimiter = rateLimit({
        windowMs: 15 * MINUTE,
        limit: 500,

        store: createRateLimitStore("menal:rate-limit:api:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        message: { error: "Too many requests. Please try again later." }
    });

    const loginLimiter = rateLimit({
        windowMs: 15 * MINUTE,
        limit: 10,

        store: createRateLimitStore("menal:rate-limit:login-ip:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        skipSuccessfulRequests: true,

        message: { error: "Too many failed login attempts. Try again in 15 minutes." },
    });

    const loginAccountLimiter = rateLimit({
        windowMs: 60 * MINUTE,
        limit: 10,

        store: createRateLimitStore("menal:rate-limit:login-account:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,
        skipSuccessfulRequests: true,

        keyGenerator: (req) => {
            const email = 
                typeof req.body?.email === "string"
                    ? req.body.email.trim().toLowerCase()
                    : "missing-email";

            return `login:${email}`;
        },

        message: { error: "Too many failed login attempts. Try again later." },
    });

    const registerLimiter = rateLimit({
        windowMs: 60 * MINUTE,
        limit: 5,

        store: createRateLimitStore("menal:rate-limit:register:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        message: { error: "Too many registration attempts. Try again later." },
    });

    const writeLimiter = rateLimit({
        windowMs: 15 * MINUTE,
        limit: 100,

        store: createRateLimitStore("menal:rate-limit:write:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        keyGenerator: (req) => {
            return `user:${req.session.userId}`;
        },

        message: { error: "Too many changes in a short amount of time. Please try again later." },
    });

    const deleteLimiter = rateLimit({
        windowMs: 60 * MINUTE,
        limit: 30,

        store: createRateLimitStore("menal:rate-limit:delete:"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        keyGenerator: (req) => {
            return `delete:user:${req.session.userId}`;
        },

        message: { error: "Too many deletions during a short time span. Please try again later." },
    });

    const nameChangeLimiter = rateLimit({
        windowMs: 60 * MINUTE,
        limit: 10,

        store: createRateLimitStore("menal:rate-limit:name-change"),

        standardHeaders: "draft-8",
        legacyHeaders: false,

        keyGenerator: (req) => {
            return `user:${req.session.userId}`;
        },

        message: { error: "Too many name changes" },
    });

    const passwordChangeLimiter = rateLimit({
        windowMs: 30 * MINUTE,
        limit: 5,

        store: createRateLimitStore("menal:rate-limit:password-change"),

        standardHeaders: "draft-8",
        legacyHeaders: false,
        keyGenerator: (req) => {
            return `user:${req.session.userId}`;
        },

        message: { error: "Too many password attempts. Try again later." },
    });

    return {
        apiLimiter,
        loginLimiter,
        loginAccountLimiter,
        registerLimiter,
        writeLimiter,
        deleteLimiter,
        nameChangeLimiter,
        passwordChangeLimiter,
    };
}
