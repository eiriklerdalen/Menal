import "dotenv/config";

import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

import cors from "cors";
import session from "express-session";

const MAX_JOURNAL_LENGTH = 10000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const app = express();
const db = new Database("./src/backend/menal.db");

app.use(cors({
    origin: "http://10.0.0.79:5173",
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false, // change if https
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month
    }
}))

// GET --------------------------------------------------------------------------------------------------------------------
app.get("/me", requireAuth, (req, res) => {
    if (!req.session.userId) {
        return res.sendStatus(401);
    }

    const user = db.prepare(`
       SELECT id, name, email
       FROM users
       WHERE id = ? 
    `).get(req.session.userId);

    res.json(user);
});

app.get("/journal_entries", requireAuth, (req, res) => {
    const userId = req.session.userId;

    const journalEntries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        ORDER BY date DESC
    `).all(userId);

    res.json(journalEntries);
});

app.get("/journal_entries/:date", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { date } = req.params;

    const journal_entry = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        AND date = ?
    `).get(userId, date);

    res.json(journal_entry ?? null);
});

app.get("/overview", requireAuth, (req, res) => {
    const userId = req.session.userId;

    const years = db.prepare(`
        SELECT DISTINCT substr(date, 1, 4) AS year
        FROM journal_entries
        WHERE user_id = ?
        ORDER BY year DESC;
    `).all(userId);

    res.json(years);
});

app.get("/overview/:year/journal_entries", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { year } = req.params;

    const journal_entries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        AND date LIKE ?
        ORDER BY date;  
    `).all(userId, `${year}-%`);

    res.json(journal_entries);
});

app.get("/overview/:year/entries", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { year } = req.params;

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
        AND entries.date LIKE ?
        ORDER BY entries.date
    `).all(userId, `${year}-%`);

    res.json(entries);
});

app.get("/overview/:year", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { year } = req.params;

    const journal_entries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        AND date LIKE ?
        ORDER BY date DESC
    `).all(userId, `${year}-%`);

    res.json(journal_entries);
})

app.get("/entries", requireAuth, (req, res) => {
    const userId = req.session.userId;

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
    `).all(userId);

    res.json(entries);
});

app.get("/entries/:date", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { date } = req.params;

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
        AND entries.date = ?
    `).all(userId, date);

    res.json(entries);
});

app.get("/calendars", requireAuth, (req, res) => {
    const userId = req.session.userId;

    const calendars = db.prepare(`
        SELECT 
        calendars.*,
        MIN(entries.date) AS oldestEntryDate
        FROM calendars
        LEFT JOIN entries ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
        GROUP BY calendars.id
        ORDER BY calendars.position
    `).all(userId);

    res.json(calendars)
});

app.get("/calendars/:calendarId", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);

    const calendar = db.prepare(`
        SELECT id, user_id, name, max_rating
        FROM calendars
        WHERE id = ?
        AND user_id = ?
    `).get(calendarId, userId);

    res.json(calendar);
});

app.get("/calendars/:calendarId/colors", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);

    // Ownership check
    const calendar = db.prepare(`
        SELECT id
        FROM calendars
        WHERE id = ?
        AND user_id = ?
    `).get(calendarId, userId);

    if (!calendar) {
        return res.sendStatus(404);
    }

    const colors = db.prepare(`
        SELECT *
        FROM calendar_rating_colors
        WHERE calendar_id = ?
        ORDER BY rating
    `).all(calendarId);

    res.json(colors);
});

app.get("/calendars/:calendarId/average", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);

    const from = req.query.from;
    const to = req.query.to;

    if (!from || !to) {
        return res.status(400).json({
            error: "Missing from or to date",
        });
    }

    const result = db.prepare(`
        SELECT AVG(entries.rating) AS average,
               COUNT(entries.id) AS count
        FROM entries
        JOIN calendars ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
          AND entries.calendar_id = ?
          AND entries.date BETWEEN ? AND ?
          AND entries.rating > 0
    `).get(userId, calendarId, from, to);

    res.json({
        calendarId,
        from,
        to,
        average: result.average,
        count: result.count,
    });
});

// POST -------------------------------------------------------------------------------------------------------------------
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Input-validering
    if (!areStrings(email, password)) {
        return badRequest(res);
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "" || password === "") {
        return badRequest(res);
    }

    try {
        const user = db.prepare(`
            SELECT *
            FROM users
            WHERE email = ?
        `).get(cleanEmail);

        if (!user) {
            return unauthorizedLogin(res);
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordIsValid) {
            return unauthorizedLogin(res);
        }

        return createSession(req, res, user);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.sendStatus(500);
        }

        res.clearCookie("connect.sid");

        res.sendStatus(204);
    })
});

app.post("/register", async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;

    // Input-validering
    if (!areStrings(email, name, password, confirmPassword)) {
        return badRequest(res);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (cleanEmail === "" ||
        cleanName === "" ||
        password === ""
    ) {
        return badRequest(res);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
        return badRequest(res, "Ugyldig e-postadresse.")
    }

    if (cleanName.length > 50) {
        return badRequest(res, "Navnet er for langt.")
    }

    if (cleanEmail.length > 254) {
        return badRequest(res, "E-postadressen er for lang.")
    }

    if (password.length < 8 || password.length > 128) {
        return badRequest(res, "Passord må være mellom 8 og 128 tegn.");
    }

    if (password !== confirmPassword) {
        return badRequest(res, "Passord matcher ikke.");
    }

    const existingUser = db.prepare(`
        SELECT id
        FROM users
        WHERE email = ?
    `).get(cleanEmail);

    if (existingUser) {
        return res.status(409).json({
            error: "E-postadresse allerede registrert."
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users
            (name, email, password_hash)
            VALUES (?, ?, ?)
        `).run(cleanName, cleanEmail, passwordHash);

        const user = db.prepare(`
            SELECT id, name, email
            FROM users
            WHERE id = ?    
        `).get(result.lastInsertRowid);

        return createSession(req, res, user, 201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post("/journal_entries", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { date, journal_text } = req.body;

    // Input-validering
    if (typeof date !== "string" ||
        typeof journal_text !== "string"
    ) {
        return badRequest(res);
    }

    if (journal_text.length > MAX_JOURNAL_LENGTH) {
        return badRequest(res, "Journaltekst må være mindre enn 10 000 tegn.")
    }

    if (!DATE_PATTERN.test(date)) {
        return badRequest(res);
    }

    try {
        const result = db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, date)
            DO UPDATE SET journal_text = excluded.journal_text;    
        `).run(userId, date, journal_text);

        res.json({
            id: result.lastInsertRowid,
            user_id: userId,
            date,
            journal_text
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post("/entries", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { calendar_id, date, rating } = req.body;

    // Input-validering (1)
    if (typeof calendar_id !== "number" ||
        typeof date !== "string" ||
        typeof rating !== "number"
    ) {
        return badRequest(res);
    }

    if (!DATE_PATTERN.test(date)) {
        return badRequest(res);
    }

    if (
        !Number.isInteger(calendar_id) ||
        !Number.isInteger(rating)
    ) {
        return badRequest(res);
    }

    try {
        // Ownership check
        const calendar = db.prepare(`
            SELECT id, max_rating
            FROM calendars
            WHERE id = ?
            AND user_id = ?
        `).get(calendar_id, userId);

        if (!calendar) {
            return res.sendStatus(404);
        }

        // Input-validering (2)
        if (rating < 1 || rating > calendar.max_rating) {
            return badRequest(res, "Rating må være mellom 1 og max_rating.")
        }

        const result = db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)
            ON CONFLICT(calendar_id, date)
            DO UPDATE SET rating = excluded.rating;
        `).run(calendar_id, date, rating);

        return res.json({
            id: result.lastInsertRowid,
            calendar_id,
            date,
            rating
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post("/calendars", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { name, max_rating } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            error: "Calendar name is required"
        });
    }

    const lastPosition = db.prepare(`
        SELECT MAX(position) AS maxPosition
        FROM calendars
        WHERE user_id = ?
    `).get(userId);

    const newPosition = (lastPosition.maxPosition ?? -1) + 1;

    const result = db.prepare(`
        INSERT INTO calendars (user_id, name, max_rating, position)
        VALUES (?, ?, ?, ?)
    `).run(userId, name, max_rating, newPosition);

    res.json({
        id: result.lastInsertRowid,
        userId,
        name,
        max_rating,
        position: newPosition
    });
});

app.post("/calendars/:calendarId/colors", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);
    const { colors } = req.body;

    const stmt = db.prepare(`
        INSERT INTO calendar_rating_colors (calendar_id, rating, color)
        VALUES (?, ?, ?)
    `);

    // Ownership check
    const calendar = db.prepare(`
        SELECT id
        FROM calendars
        WHERE id = ?
        AND user_id = ?
    `).get(calendarId, userId);

    if (!calendar) {
        return res.sendStatus(404);
    }

    colors.forEach((color, index) => {
        stmt.run(calendarId, index + 1, color);
    });

    res.json({ success: true });
});

// DELETE -----------------------------------------------------------------------------------------------------------------
app.delete("/entries/:calendarId/:date", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);
    const { date } = req.params;

    // Ownership check
    const calendar = db.prepare(`
        SELECT user_id
        FROM calendars
        WHERE id = ?
    `).get(calendarId);

    if (!calendar || calendar.user_id !== userId) {
        return res.sendStatus(404);
    }

    const result = db.prepare(`
        DELETE FROM entries
        WHERE calendar_id = ?
        AND date = ?
    `).run(calendarId, date);

    res.json({
        success: true,
        changes: result.changes,
    });
});

app.delete("/calendars/:calendarId", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);

    // Ownership check 
    const calendar = db.prepare(`
        SELECT id
        FROM calendars
        WHERE id = ?
        AND user_id = ?    
    `).get(calendarId, userId);

    if (!calendar) {
        return res.sendStatus(404);
    }

    const deleteCalendar = db.transaction((calendarId, userId) => {
        db.prepare(`
            DELETE FROM entries
            WHERE calendar_id = ?    
        `).run(calendarId);

        db.prepare(`
            DELETE FROM calendar_rating_colors
            WHERE calendar_id = ?
        `).run(calendarId);

        db.prepare(`
            DELETE FROM calendars
            WHERE id = ?
            and user_id = ?
        `).run(calendarId, userId);
    });

    deleteCalendar(calendarId, userId);
    res.json({ success: true })
});

app.delete("/journal_entries/:date", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { date } = req.params;

    const result = db.prepare(`
        DELETE FROM journal_entries
        WHERE user_id = ?
        AND date = ?
    `).run(userId, date)

    res.json({ success: true });
});

// PATCH ------------------------------------------------------------------------------------------------------------------
app.patch("/calendars/:calendarId", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);

    const { name } = req.body;
    
    db.prepare(`
        UPDATE calendars
        SET name = ?
        WHERE id = ?
        AND user_id = ?
    `).run(name, calendarId, userId);

    res.json({ success: true });
})

// PUT --------------------------------------------------------------------------------------------------------------------
app.put("/calendars/:calendarId/colors", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const calendarId = Number(req.params.calendarId);
    const { colors } = req.body;

    // Ownership check
    const calendar = db.prepare(`
        SELECT user_id
        FROM calendars
        WHERE id = ?
    `).get(calendarId);

    if (!calendar || calendar.user_id !== userId) {
        return res.sendStatus(404);
    }

    db.prepare(`
        DELETE FROM calendar_rating_colors
        WHERE calendar_id = ?
    `).run(calendarId);

    const stmt = db.prepare(`
        INSERT INTO calendar_rating_colors (calendar_id, rating, color)
        VALUES (?, ?, ?)
    `);

    colors.forEach((color, index) => {
        stmt.run(calendarId, index + 1, color);
    });

    res.json({ success: true });
});

// Auth -------------------------------------------------------------------------------------------------------------------
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Authentication required."
        });
    }

    next();
}

// RUN
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://10.0.0.79:3000");
});

// Input-validation --------------------------------------------------------------------------------------------------------
function areStrings(...values) {
    return values.every((value) => typeof value === "string");
}

function badRequest(res, message="Invalid input.") {
    return res.status(400).json({ error: message });
}

function unauthorizedLogin(res) {
    return res.status(401).json({ error: "Invalid email or password."});
}

function createSession(req, res, user, status = 200) {
    req.session.userId = user.id;

    req.session.save((err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.status(status).json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    });
}