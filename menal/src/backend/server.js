import express from "express";
import Database from "better-sqlite3";

import cors from "cors";

const app = express();
const db = new Database("menal.db");

app.use(cors());
app.use(express.json());

// GET --------------------------------------------------------------------------------------------------------------------
app.get("/profiles/:profileId/journal_entries", (req, res) => {
    const profileId = Number(req.params.profileId);

    const journal_entries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE profile_id = ?
    `).all(profileId);

    res.json(journal_entries);
});

app.get("/profiles/:profileId/journal_entries/:date", (req, res) => {
    const profileId = Number(req.params.profileId);

    const entry = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE profile_id = ?
        AND date = ?    
    `).get(profileId, req.params.date);

    res.json(entry);
})

app.get("/profiles/:profileId/entries", (req, res) => {
    const profileId = Number(req.params.profileId);

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.profile_id = ?
    `).all(profileId);

    res.json(entries);
});

app.get("/profiles/:profileId/entries/:date", (req, res) => {
    const { profileId, date } = req.params;

    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.profile_id = ?
        AND entries.date = ?
    `).all(profileId, date);

    res.json(entries);
});

app.get("/profiles/:profileId/calendars", (req, res) => {
    const profileId = Number(req.params.profileId);

    const calendars = db.prepare(`
        SELECT *
        FROM calendars
        WHERE profile_id = ?
    `).all(profileId);

    res.json(calendars)
});

app.get("/profiles/:profileId/calendars/:calendarId/colors", (req, res) => {
    const profileId = Number(req.params.profileId);
    const calendarId = Number(req.params.calendarId);

    const colors = db.prepare(`
        SELECT *
        FROM calendar_rating_colors
        WHERE calendar_id = ?
        ORDER BY rating
    `).all(calendarId);

    res.json(colors);
})

// POST -------------------------------------------------------------------------------------------------------------------
app.post("/profiles/:profileId/journal_entries", (req, res) => {
    const profileId = Number(req.params.profileId);
    const { profile_id, date, journal_text } = req.body;

    const stmt = db.prepare(`
        INSERT INTO journal_entries (profile_id, date, journal_text)
        VALUES (?, ?, ?)
        ON CONFLICT(profile_id, date)
        DO UPDATE SET journal_text = excluded.journal_text;    
    `);

    const result = stmt.run(profile_id, date, journal_text);

    res.json({
        id: result.lastInsertRowid,
        profile_id: 1, // Husk å endre!
        date,
        journal_text
    });
});

app.post("/profiles/:profileId/entries", (req, res) => {
    const profileId = Number(req.params.profileId);

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

app.post("/profiles/:profileId/calendars", (req, res) => {
    const profileId = Number(req.params.profileId);
    const { name, max_rating } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            error: "Calendar name is required"
        });
    }

    const result = db.prepare(`
        INSERT INTO calendars (profile_id, name, max_rating)
        VALUES (?, ?, ?)
    `).run(profileId, name, max_rating);

    res.json({
        id: result.lastInsertRowid,
        profileId,
        name,
        max_rating
    });
});

// DELETE -----------------------------------------------------------------------------------------------------------------

app.delete("/profiles/:profileId/calendars/:calendarId", (req, res) => {
    const profileId = Number(req.params.profileId);
    const calendarId = Number(req.params.calendarId);

    db.prepare(`
        DELETE FROM calendars
        WHERE id = ?
        and profile_id = ?
    `).run(calendarId, profileId);

    res.json({ success: true })
});

// RUN
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://10.0.0.76:3000");
});