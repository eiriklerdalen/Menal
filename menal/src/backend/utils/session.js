export function createSession(req, res, user, status=200, sessionRegistry) {
    req.session.regenerate((regenerateError) => {
        if (regenerateError) {
            console.error(regenerateError);
            return res.sendStatus(500);
        }

        req.session.userId = user.id;

        req.session.save(async (saveError) => {
            if (saveError) {
                console.error(saveError);
                return res.sendStatus(500);
            }

            res.status(status).json({
                id: user.id,
                name: user.name,
                email: user.email,
            });

            await sessionRegistry.addSession(user.id, req.sessionID);
        });
    });
}