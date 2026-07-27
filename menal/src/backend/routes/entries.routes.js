import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { validateDate, validateCalendarId, validateMaxRating, validateRating } from "../validation/validators.js";

export function createEntriesRouter({db, writeLimiter, deleteLimiter}) {
    const router = Router();

    router.use(requireAuth);

    router.get("/", (req, res) => {
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

    router.get("/:date", (req, res) => {
        const userId = req.session.userId;
        const { date } = req.params;
        
        // Input-validering
        if (!validateDate(date)) {
            return badRequest(res);
        }
    
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

    router.post("/", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const { calendar_id, date, rating } = req.body ?? {};
    
        // Input-validering (1)
        if (!validateCalendarId(calendar_id)) {
            return badRequest(res);
        }
    
        if (!validateDate(date)) {
            return badRequest(res);
        }

        if (!validateMaxRating(rating)) {
            return badRequest(res, "Invalid rating.");
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
            if (!validateRating(rating, calendar.max_rating)) {
                return badRequest(res, "Rating must be in range 1 to max rating.");
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

    router.delete("/:calendarId/:date", deleteLimiter, (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
        const { date } = req.params;
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        if (!validateDate(date)) {
            return badRequest(res);
        }
    
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

    return router;
}