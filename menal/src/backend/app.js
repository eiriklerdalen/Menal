import express from "express";
import session from "express-session";
import path from "node:path";

import { RedisStore } from "connect-redis";

import cors from "cors";
import helmet from "helmet";

import { csrfSync } from "csrf-sync";

import { createSessionRegistry } from "./sessions/sessionRegistry.js";

import { createAuthRouter } from "./routes/auth.routes.js";
import { createCalendarsRouter } from "./routes/calendars.routes.js";
import { createEntriesRouter } from "./routes/entries.routes.js";
import { createJournalRouter } from "./routes/journal.routes.js";
import { createOverviewRouter } from "./routes/overview.routes.js";
import { createAccountRouter } from "./routes/account.routes.js";

export function createApp({
    db,
    redisClient,
    sessionSecret,
    isProduction,
    limiters,
    apiPrefix = "",
    staticDir = null,
}) {
    const app = express();

    if (isProduction) {
        app.set("trust proxy", 1);
    }

    if (!isProduction) {
        app.use(cors({
            origin: [
                "http://localhost:5173",
                "http://10.0.0.81:5173",
                "http://127.0.0.1:5173",
                "http://192.168.0.28:5173",
                "http://192.168.0.117:5173",
            ],
            credentials: true,
        }));
    }

    app.use(helmet());

    app.get(`${apiPrefix}/health`, (req, res) => {
        res.json({ status: "ok" });
    });

    app.use(apiPrefix, limiters.apiLimiter);
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

    const sessionRegistry = createSessionRegistry(redisClient);

    // CSRF ------------------------------------------------------------------------------------------------------------------
    const { generateToken, csrfSynchronisedProtection } = csrfSync()
    
    app.get(`${apiPrefix}/csrf-token`, (req, res) => {
        res.json({
            csrfToken: generateToken(req),
        });
    });

    app.use(apiPrefix, csrfSynchronisedProtection);

    // Routes ----------------------------------------------------------------------------------------------------------------
    app.use(apiPrefix, createAuthRouter({
        db,
        sessionRegistry,
        loginLimiter: limiters.loginLimiter,
        loginAccountLimiter: limiters.loginAccountLimiter,
        registerLimiter: limiters.registerLimiter,
    }));

    app.use(`${apiPrefix}/calendars`, createCalendarsRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use(`${apiPrefix}/entries`, createEntriesRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use(`${apiPrefix}/journal_entries`, createJournalRouter({
        db,
        writeLimiter: limiters.writeLimiter,
        deleteLimiter: limiters.deleteLimiter,
    }));

    app.use(`${apiPrefix}/overview`, createOverviewRouter({
        db,
    }));
    
    app.use(`${apiPrefix}/account`, createAccountRouter({
        db,
        sessionRegistry,
        writeLimiter: limiters.writeLimiter,
        nameChangeLimiter: limiters.nameChangeLimiter,
        passwordChangeLimiter: limiters.passwordChangeLimiter,
    }));

    if (staticDir) {
        app.use(apiPrefix, (req, res) => {
            res.status(404).json({ error: "Not found." });
        });

        app.use(express.static(staticDir));
        app.get("/{*splat}", (req, res) => {
            res.sendFile(path.join(staticDir, "index.html"));
        });
    }

    app.use((error, req, res, next) => {
        if (error.code === "EBADCSRFTOKEN") {
            return res.status(403).json({
                error: "Invalid CSRF token.",
            });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    });

    return app;
}
