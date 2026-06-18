import express from "express";
import Database from "better-sqlite3";

import cors from "cors";

const app = express();
const db = new Database("menal.db");

app.use(cors());
app.use(express.json());

// GET -------------------------------------
app.get("/journal_entries", (req, res) => {
    const journal_entries = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE profile_id = 1
    `).all();

    res.json(journal_entries)
});

app.get("/journal_entries/:date", (req, res) => {
    const entry = db.prepare(`
        SELECT *
        FROM journal_entries
        WHERE profile_id = 1
        AND date = ?    
    `).get(req.params.date);

    res.json(entry);
})

app.get("/entries", (req, res) => {
    const entries = db.prepare(`
        SELECT entries.*
        FROM entries
        JOIN calendars
            ON entries.calendar_id = calendars.id
        WHERE calendars.profile_id = 1
    `).all();

    res.json(entries);
});

app.get("/calendars", (req, res) => {
    const calendars = db.prepare(`
        SELECT *
        FROM calendars
        WHERE profile_id = 1
    `).all();

    res.json(calendars)
});

// POST ------------------------------------
app.post("/journal_entries", (req, res) => {
    const { profile_id, date, journal_text } = req.body;

    const stmt = db.prepare(`
        INSERT INTO journal_entries (profile_id, date, journal_text)
        VALUES (?, ?, ?)
        ON CONFLICT(profile_id, date)
        DO UPDATE SET journal_text = excluded.journal_text;    
    `)

    const result = stmt.run(profile_id, date, journal_text)

    res.json({
        id: result.lastInsertRowid,
        profile_id: 1, // Husk å endre!
        date,
        journal_text
    });
});

app.post("/entries", (req, res) => {
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


// RUN
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://10.0.0.74:3000");
});