import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { areStrings, validateName, validateEmail, validatePassword } from "../validation/validators.js";

import bcrypt from "bcrypt";

export function createAuthRouter({ db, loginLimiter, loginAccountLimiter, registerLimiter }) {
    const router = Router();

    router.get("/me", requireAuth, (req, res) => {
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

    router.post("/login", loginLimiter, loginAccountLimiter, async (req, res) => {
        const { email, password } = req.body ?? {};
    
        // Input-validering
        if (!areStrings(email, password)) {
            return badRequest(res);
        }
    
        const cleanEmail = email.trim().toLowerCase();

        if (!validateEmail(cleanEmail)) {
            return badRequest(res, "Invalid email or password.");
        }

        if (!validatePassword(password)) {
            return badRequest(res, "Invalid email or password.");
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

    router.post("/logout", requireAuth, (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.sendStatus(500);
            }

            res.clearCookie("connect.sid");

            res.sendStatus(204);
        });
    });

    router.post("/register", registerLimiter, async (req, res) => {
        const { email, name, password, confirmPassword } = req.body ?? {};
        
        // Input-validering
        if (!areStrings(email, name, password, confirmPassword)) {
            return badRequest(res);
        }
    
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        if (!validateEmail(cleanEmail)) {
            return badRequest(res, "Invalid email adress.");
        }

        if (!validateName(cleanName)) {
            return badRequest(res, "Name too long or empty.");
        }

        if (!validatePassword(password)) {
            return badRequest(res, "Invalid password.");
        }
    
        if (password !== confirmPassword) {
            return badRequest(res, "Passwords does not match.");
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

    return router;
}