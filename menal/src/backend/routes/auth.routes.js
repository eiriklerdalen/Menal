import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

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
    
        if (cleanEmail === "" || password === "") {
            return badRequest(res);
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
    
        if (cleanEmail === "" ||
            password === ""
        ) {
            return badRequest(res);
        }
    
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!emailPattern.test(cleanEmail)) {
            return badRequest(res, "Ugyldig e-postadresse.")
        }
    
        if (!validateName(cleanName)) {
            return badRequest(res, "Name too long or empty.");
        }
    
        if (cleanEmail.length > 254 || password.length > 128) {
            return badRequest(res, "Email or password is too long.")
        }
    
        if (password.length < 8 || password.length > 128) {
            return badRequest(res, "Passord må være mellom 8 og 128 tegn.");
        }
    
        if (password !== confirmPassword) {
            return badRequest(res, "Passord matcher ikke.");
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