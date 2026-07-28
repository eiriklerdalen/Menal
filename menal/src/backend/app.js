import express from "express";
import session from "express-session";

import { RedisStore } from "connect-redis";

import cors from "cors";
import helmet from "helmet";

import { csrfSync } from "csrf-sync";

import { createAuthRouter } from "./routes/auth.routes.js";
import { createCalendarsRouter } from "./routes/calendars.routes.js";
import { createEntriesRouter } from "./routes/entries.routes.js";
import { createJournalRouter } from "./routes/journal.routes.js";
import { createOverviewRouter } from "./routes/overview.routes.js";

export function createApp({
    db,
    redisClient,
    sessionSecret,
    isProduction,
    limiters,
}) {
    const app = express();

    if (isProduction) {
        app.set("trust proxy", 1);
    }

    app.use(cors({
        origin: [
            "http://localhost:5173",
            "http://10.0.0.81:5173",
            "http://127.0.0.1:5173",
        ],
        credentials: true,
    }));

    app.use(helmet());

    app.use(limiters.apiLimiter);
    app.use(express.json());

    const sessionStore = new RedisStore({
        client: redisClient,
        prefix: "menal:session:",
    });

    app.use(session({
        store: sessionStore,
    
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
    
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month
        }
    }));

    // CSRF ------------------------------------------------------------------------------------------------------------------
    const { generateToken, csrfSynchronisedProtection } = csrfSync()
    
    app.get("/csrf-token", (req, res) => {
        res.json({
            csrfToken: generateToken(req),
        });
    });

    app.use(csrfSynchronisedProtection);

    // Routes ----------------------------------------------------------------------------------------------------------------
    app.use("/", createAuthRouter({
        db,
        loginLimiter: limiters.loginLimiter,
        loginAccountLimiter: limiters.loginAccountLimiter,
        registerLimiter: limiters.registerLimiter,
    }));

    app.use("/calendars", createCalendarsRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use("/entries", createEntriesRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use("/journal_entries", createJournalRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use("/overview", createOverviewRouter({
        db,
    }));

    app.use((error, req, res, next) => {
        if (error.code === "EBADCSRFTOKEN") {
            return res.status(403).json({
                error: "Invalid CSRF token.",
            });
        }

        return next(error);
    });

    return app;
}