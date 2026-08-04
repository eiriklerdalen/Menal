import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";

import { areStrings, validateName, validatePassword } from "../validation/validators.js";

import { badRequest, unauthorizedLogin } from "../utils/httpResponses.js";

import bcrypt from "bcrypt";

export function createAccountRouter({ db, nameChangeLimiter, passwordChangeLimiter, writeLimiter }) {
    const router = Router();

    router.use(requireAuth);

    router.patch("/name", nameChangeLimiter, writeLimiter, (req, res) => {
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

    router.patch("/password", passwordChangeLimiter, writeLimiter, async (req, res) => {
        const userId = req.session.userId;

        const { password, newPassword, confirmPassword } = req.body ?? {};

        if (!areStrings(password, newPassword, confirmPassword)) {
            return badRequest(res);
        }

        if (newPassword !== confirmPassword) {
            return badRequest(res, "Passwords are not equal.");
        }

        if (!validatePassword(newPassword) ||
            !validatePassword(confirmPassword)
        ) {
            return badRequest(res, "Invalid new password");
        }

        try {
            const user = db.prepare(`
                SELECT id, password_hash
                FROM users
                WHERE id = ?    
            `).get(userId);

            if (!user) {
                return res.sendStatus(404);
            }

            const passwordIsValid = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordIsValid) {
                return unauthorizedLogin(res);
            }

            const passwordHash = await bcrypt.hash(newPassword, 12);

            const result = db.prepare(`
                UPDATE users
                SET password_hash = ?
                WHERE id = ?
            `).run(passwordHash, userId);

            if (result.changes === 0) {
                return res.sendStatus(404);
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });

    return router; 
}