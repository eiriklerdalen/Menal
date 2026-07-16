import "dotenv/config";

import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

import cors from "cors";
import session from "express-session";

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
app.get("/me", (req, res) => {
    if (!req.session.userId) {
        return res.sendStatus(401);
    }

    const user = db.prepare(`
       SELECT id, name, email
       FROM users
       WHERE id = ? 
    `).get(req.session.userId);

    res.json(user);
})

app.get("/users/:userId", (req, res) => {
    const userId= Number(req.params.userId);

    const user = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE id = ?
    `).get(userId);

    res.json(user);
});

app.get("/users/:userId/journal_entries", (req, res) => {
    const userId = Number(req.params.userId);

    const journal_entries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        ORDER BY date DESC
    `).all(userId);

    res.json(journal_entries);
});

app.get("/users/:userId/journal_entries/:date", (req, res) => {
    const userId = Number(req.params.userId);
    const { date } = req.params;

    const journal_entry = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE user_id = ?
        AND date = ?
    `).get(userId, date);

    res.json(journal_entry ?? null);
});

app.get("/users/:userId/overview/:year/journal_entries", (req, res) => {
    const userId = Number(req.params.userId);
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

app.get("/users/:userId/overview", (req, res) => {
    const userId = Number(req.params.userId);

    const years = db.prepare(`
        SELECT DISTINCT substr(date, 1, 4) AS year
        FROM journal_entries
        WHERE user_id = ?
        ORDER BY year DESC;
    `).all(userId);

    res.json(years);
});

app.get("/users/:userId/overview/:year/entries", (req, res) => {
    const userId = Number(req.params.userId);
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

app.get("/users/:userId/overview/:year", (req, res) => {
    const userId = Number(req.params.userId);
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

app.get("/users/:userId/entries", (req, res) => {
    const userId = Number(req.params.userId);

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.user_id = ?
    `).all(userId);

    res.json(entries);
});

app.get("/users/:userId/entries/:date", (req, res) => {
    const { userId, date } = req.params;

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

app.get("/users/:userId/calendars", (req, res) => {
    const userId = Number(req.params.userId);

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

app.get("/users/:userId/calendars/:calendarId", (req, res) => {
    const userId = Number(req.params.userId);
    const calendarId = Number(req.params.calendarId);

    const calendar = db.prepare(`
        SELECT id, user_id, name, max_rating
        FROM calendars
        WHERE id = ?
        AND user_id = ?
    `).get(calendarId, userId);

    res.json(calendar);
});

app.get("/users/:userId/calendars/:calendarId/colors", (req, res) => {
    const userId = Number(req.params.userId);
    const calendarId = Number(req.params.calendarId);

    const colors = db.prepare(`
        SELECT *
        FROM calendar_rating_colors
        WHERE calendar_id = ?
        ORDER BY rating
    `).all(calendarId);

    res.json(colors);
});

app.get("/users/:userId/calendars/:calendarId/average", (req, res) => {
    const userId = Number(req.params.userId);
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

    const user = db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
    `).get(email);

    if (!user) {
        return res.status(401).json({ error: "Invalid email or password."});
    }

    const passwordIsValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordIsValid) {
        return res.status(401).json({ error: "Invalid email or password."});
    }

    req.session.userId = user.id;

    res.json({
        id: user.id,
        userId: user.id,
        email: user.email,
    });
});

//app.post("/logout", (req, res) => {})

app.post("/register", async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            error: "Passwords do not match.",
        });
    }

    const existingUser = db.prepare(`
        SELECT id
        FROM users
        WHERE email = ?
    `).get(email);

    if (existingUser) {
        return res.status(409).json({
            error: "Email already exists."
        });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
        INSERT INTO users
        (name, email, password_hash)
        VALUES (?, ?, ?)
    `).run(name, email, passwordHash);

    const user = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE id = ?    
    `).get(result.lastInsertRowid);

    res.status(201).json({
        userId: user.id,
        name: user.name,
        email: user.email,
    });
}) 

app.post("/users/:userId/journal_entries", (req, res) => {
    const userId = Number(req.params.userId);
    const { date, journal_text } = req.body;

    const stmt = db.prepare(`
        INSERT INTO journal_entries (user_id, date, journal_text)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, date)
        DO UPDATE SET journal_text = excluded.journal_text;    
    `);

    const result = stmt.run(userId, date, journal_text);

    res.json({
        id: result.lastInsertRowid,
        user_id: userId,
        date,
        journal_text
    });
});

app.post("/users/:userId/entries", (req, res) => {
    const userId = Number(req.params.userId);

    const { calendar_id, date, rating } = req.body;

    const stmt = db.prepare(`
        INSERT INTO entries (calendar_id, date, rating)
        VALUES (?, ?, ?)
        ON CONFLICT(calendar_id, date)
        DO UPDATE SET rating = excluded.rating;
    `);

    const result = stmt.run(calendar_id, date, rating);

    res.json({
        id: result.lastInsertRowid,
        calendar_id,
        date,
        rating
    });
});

app.post("/users/:userId/calendars", (req, res) => {
    const userId = Number(req.params.userId);
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

app.post("/users/:userId/calendars/:calendarId/colors", (req, res) => {
    const calendarId = Number(req.params.calendarId);
    const { colors } = req.body;

    const stmt = db.prepare(`
        INSERT INTO calendar_rating_colors (calendar_id, rating, color)
        VALUES (?, ?, ?)
    `);

    colors.forEach((color, index) => {
        stmt.run(calendarId, index + 1, color);
    });

    res.json({ success: true });
})

// DELETE -----------------------------------------------------------------------------------------------------------------

app.delete("/users/:userId/entries/:calendarId/:date", (req, res) => {
    const calendarId = Number(req.params.calendarId);
    const { date } = req.params;

    const result = db.prepare(`
        DELETE FROM entries
        WHERE calendar_id = ?
        AND date = ?
    `).run(calendarId, date);

    res.json({
        success: true,
        changes: result.changes,
    });
})

app.delete("/users/:userId/calendars/:calendarId", (req, res) => {
    const userId = Number(req.params.userId);
    const calendarId = Number(req.params.calendarId);

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

    res.json({ success: true })
});

app.delete("/users/:userId/journal_entries/:date", (req, res) => {
    const userId = Number(req.params.userId);
    const { date } = req.params;

    const result = db.prepare(`
        DELETE FROM journal_entries
        WHERE user_id = ?
        AND date = ?
    `).run(userId, date)

    res.json({ success: true });
});

// PATCH ------------------------------------------------------------------------------------------------------------------
app.patch("/users/:userId/calendars/:calendarId", (req, res) => {
    const userId = Number(req.params.userId);
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
app.put("/users/:userId/calendars/:calendarId/colors", (req, res) => {
    const calendarId = Number(req.params.calendarId);
    const { colors } = req.body;

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
})

// RUN
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://10.0.0.79:3000");
});