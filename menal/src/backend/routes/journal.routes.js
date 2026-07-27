import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { validateDate, validateJournalText } from "../validation/validators.js";

export function createJournalRouter({ db, writeLimiter, deleteLimiter }) {
    const router = Router();

    router.use(requireAuth);

    // GET -----------------------------------------------------------------------------------------------------------------
    router.get("/", (req, res) => {
        const userId = req.session.userId;
    
        const journalEntries = db.prepare(`
            SELECT *
            FROM journal_entries
            WHERE user_id = ?
            ORDER BY date DESC
        `).all(userId);
    
        res.json(journalEntries);
    });

    router.get("/:date", (req, res) => {
        const userId = req.session.userId;
        const { date } = req.params;
    
        // Input-validering
        if (!validateDate(date)) {
            return badRequest(res);
        }
    
        const journal_entry = db.prepare(`
            SELECT *
            FROM journal_entries
            WHERE user_id = ?
            AND date = ?
        `).get(userId, date);
    
        res.json(journal_entry ?? null);
    });

    // POST ---------------------------------------------------------------------------------------------------------------
    router.post("/", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const { date, journal_text } = req.body ?? {};
    
        // Input-validering
        if (!validateJournalText(journal_text)) {
            return badRequest(res);
        }
    
        if (!validateDate(date)) {
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

    // DELETE -----------------------------------------------------------------------------------------------------------
    router.delete("/:date", deleteLimiter, (req, res) => {
        const userId = req.session.userId;
        const { date } = req.params;
    
        // Input-validering
        if (!validateDate(date)) {
            return badRequest(res);
        }
    
        const result = db.prepare(`
            DELETE FROM journal_entries
            WHERE user_id = ?
            AND date = ?
        `).run(userId, date)
    
        res.json({ success: true });
    });

    return router;
}