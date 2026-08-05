export function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            code: "SESSION_REQUIRED",
            error: "Authentication required."
        });
    }

    next();
}