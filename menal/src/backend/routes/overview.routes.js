import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { validateYear } from "../validation/validators.js";
import { badRequest } from "../utils/httpResponses.js";

export function createOverviewRouter({ db }) {
    const router = Router();

    router.use(requireAuth);

    router.get("/", (req, res) => {
        const userId = req.session.userId;
        
        const years = db.prepare(`
            SELECT DISTINCT substr(date, 1, 4) AS year
            FROM journal_entries
            WHERE user_id = ?
            ORDER BY year DESC;
        `).all(userId);
    
        res.json(years);
    });

    router.get("/:year/journal_entries", (req, res) => {
        const userId = req.session.userId;
        const { year } = req.params;
    
        if (!validateYear(year)) {
            return badRequest(res);
        }
    
        const journal_entries = db.prepare(`
            SELECT *
            FROM journal_entries
            WHERE user_id = ?
            AND date LIKE ?
            ORDER BY date;  
        `).all(userId, `${year}-%`);
    
        res.json(journal_entries);
    });

    router.get("/:year/entries", (req, res) => {
        const userId = req.session.userId;
        const { year } = req.params;
    
        if (!validateYear(year)) {
            return badRequest(res);
        }
    
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

    router.get("/:year", (req, res) => {
        const userId = req.session.userId;
        const { year } = req.params;
    
        if (!validateYear(year)) {
            return badRequest(res);
        }
    
        const journal_entries = db.prepare(`
            SELECT *
            FROM journal_entries
            WHERE user_id = ?
            AND date LIKE ?
            ORDER BY date DESC
        `).all(userId, `${year}-%`);
    
        res.json(journal_entries);
    });

    return router;
}