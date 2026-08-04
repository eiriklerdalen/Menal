import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { 
    validateCalendarId,
    validateDateInterval,
    validateName, 
    validateColors, 
    validateMaxRating, 
    validateColorCount,
    areStrings
} from "../validation/validators.js";
import { badRequest } from "../utils/httpResponses.js";

export function createCalendarsRouter({ db, writeLimiter, deleteLimiter }) {
    const router = Router();

    router.use(requireAuth);

    // GET -----------------------------------------------------------------------------------------------------------------
    router.get("/", (req, res) => {
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
    
        res.json(calendars);
    });

    router.get("/:calendarId", (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        const calendar = db.prepare(`
            SELECT id, user_id, name, max_rating
            FROM calendars
            WHERE id = ?
            AND user_id = ?
        `).get(calendarId, userId);

        if (!calendar) {
            return res.sendStatus(404);
        }
    
        return res.json(calendar);
    });

    router.get("/:calendarId/colors", (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
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
    
        if (!colors) {
            res.sendStatus(404);
        }

        return res.json(colors);
    });

    router.get("/:calendarId/average", (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
    
        const from = req.query.from;
        const to = req.query.to;
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        if (!validateDateInterval(from, to)) {
            return badRequest(res, "Invalid date range.");
        }

        // Ownership check
        const calendar = db.prepare(`
            SELECT id
            FROM calendars
            WHERE id = ?
            and user_id = ?    
        `).get(calendarId, userId);

        if (!calendar) {
            return res.sendStatus(404);
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

    // POST ---------------------------------------------------------------------------------------------------------------
    router.post("/", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const { name, max_rating } = req.body ?? {};
    
        // Input-validering
        if (!areStrings(name)) {
            return badRequest(res);
        }

        if (!validateMaxRating(max_rating)) {
            return badRequest(res);
        }
    
        const cleanName = name.trim();
        if (!validateName(cleanName)) {
            return badRequest(res, "Name too long or empty.");
        }
    
        try {
            const lastPosition = db.prepare(`
                SELECT MAX(position) AS maxPosition
                FROM calendars
                WHERE user_id = ?
            `).get(userId);
    
            const newPosition = (lastPosition.maxPosition ?? -1) + 1;
    
            const result = db.prepare(`
                INSERT INTO calendars (user_id, name, max_rating, position)
                VALUES (?, ?, ?, ?)
            `).run(userId, cleanName, max_rating, newPosition);
    
            res.status(201).json({
                id: result.lastInsertRowid,
                userId,
                name,
                max_rating,
                position: newPosition
            });
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });

    router.post("/:calendarId/colors", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
        const { colors } = req.body ?? {};
    
        // Input-validering (1)
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        if (!validateColors(colors)) {
            return badRequest(res);
        }
    
        // Ownership check
        const calendar = db.prepare(`
            SELECT id, max_rating
            FROM calendars
            WHERE id = ?
            AND user_id = ?
        `).get(calendarId, userId);
    
        if (!calendar) {
            return res.sendStatus(404);
        }
    
        // Input-validering (2)
        if (!validateColorCount(colors, calendar.max_rating)) {
            return badRequest(res);
        }
    
        const stmt = db.prepare(`
            INSERT INTO calendar_rating_colors (calendar_id, rating, color)
            VALUES (?, ?, ?)
        `);
    
        colors.forEach((color, index) => {
            stmt.run(calendarId, index + 1, color);
        });
    
        res.json({ success: true });
    });

    // DELETE -----------------------------------------------------------------------------------------------------------
    router.delete("/:calendarId", deleteLimiter, (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
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
        res.json({ success: true });
    });

    // PATCH ---------------------------------------------------------------------------------------------------------------
    router.patch("/:calendarId", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
        const { name } = req.body ?? {};
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        if (!areStrings(name)) {
            return badRequest(res);
        }
    
        const cleanName = name.trim();
    
        if (!validateName(cleanName)) {
            return badRequest(res, "Name too long or empty.");
        }
        
        const result = db.prepare(`
            UPDATE calendars
            SET name = ?
            WHERE id = ?
            AND user_id = ?
        `).run(cleanName, calendarId, userId);
    
        if (result.changes === 0) {
            return res.sendStatus(404);
        }
    
        return res.json({ success: true });
    });

    // PUT -----------------------------------------------------------------------------------------------------------------
    router.put("/:calendarId/colors", writeLimiter, (req, res) => {
        const userId = req.session.userId;
        const calendarId = Number(req.params.calendarId);
        const { colors } = req.body ?? {};
    
        // Input-validering
        if (!validateCalendarId(calendarId)) {
            return badRequest(res);
        }
    
        if (!validateColors(colors)) {
            return badRequest(res);
        }
    
        // Ownership check
        const calendar = db.prepare(`
            SELECT user_id, max_rating
            FROM calendars
            WHERE id = ?
        `).get(calendarId);
    
        if (!calendar || calendar.user_id !== userId) {
            return res.sendStatus(404);
        }
    
        // Input-validering (2)
        if (!validateColorCount(colors, calendar.max_rating)) {
            return badRequest(res);
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

    return router;
}