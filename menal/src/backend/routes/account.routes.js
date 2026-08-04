import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";

import { validateName, validatePassword } from "../validation/validators.js";

import { badRequest, unauthorizedLogin } from "../utils/httpResponses.js";

export function createAccountRouter({ db, writeLimiter }) {
    const router = Router();

    router.use(requireAuth);

    router.patch("/name", writeLimiter, (req, res) => {
        const userId = req.session.userId;

        const { name } = req.body ?? {};

        if (!validateName(name)) {
            return badRequest(res);
        }

        const cleanName = name.trim();

        const result = db.prepare(`
            UPDATE users
            SET name = ?
            WHERE id = ?
        `).run(cleanName, userId);
        
        if (result.changes === 0) {
            return res.sendStatus(404);
        }

        return res.json({
            id: userId,
            name: cleanName,
        });
    });

    return router; 
}