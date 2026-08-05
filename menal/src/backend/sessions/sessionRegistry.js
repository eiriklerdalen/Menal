const SESSION_PREFIX = "menal:session:";
const USER_SESSION_PREFIX = "menal:user-sessions:";

export function createSessionRegistry(redisClient) {
    function userSessionKey(userId) {
        return `${USER_SESSION_PREFIX}${userId}`;
    }

    async function addSession(userId, sessionId) {
        const key = userSessionKey(userId);

        await redisClient.sAdd(key, sessionId);
        await redisClient.expire(key, 60 * 60 * 24 * 30);
    }

    async function removeSession(userId, sessionId) {
        await redisClient.sRem(
            userSessionKey(userId),
            sessionId,
        );
    }

    async function revokeOtherSessions(userId, currentSessionId) {
        const key = userSessionKey(userId);
        const sessionIds = await redisClient.sMembers(key);

        const sessionsToRemove = sessionIds.filter((sessionId) => {
            return sessionId !== currentSessionId
        });

        if (sessionsToRemove.length === 0) {
            return;
        }

        const transaction = redisClient.multi();

        for (const sessionId of sessionsToRemove) {
            transaction.del(`${SESSION_PREFIX}${sessionId}`);
            transaction.sRem(key, sessionId);
        }

        await transaction.exec();
    }

    return {
        addSession,
        removeSession,
        revokeOtherSessions,
    };
}