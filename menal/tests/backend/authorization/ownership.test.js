import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../helpers/createTestApp.js";

import { getCsrfAgent } from "../helpers/createCsrfAgent.js";
import { createTestUser } from "../helpers/createTestUser.js";
import { createAuthenticatedAgent } from "../helpers/createAuthenticatedAgent.js";

describe("authorization", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    })

    testCalendarsOwnership(
        () => app,
        () => db,
    );
});

function testCalendarsOwnership(getApp, getDb) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("does not allow user A to read user B's calendar", async () => {
        const userA = await createTestUser(
            getDb(),
            "User A",
            "a@test.com",
            "password123",
        );

        const userB = await createTestUser(
            getDb(),
            "User B",
            "b@test.com",
            "password123"
        );

        const db = getDb();

        const result = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 3, 0);

        const calendarId = Number(result.lastInsertRowid);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent
            .get(`/calendars/${calendarId}`);

        expect(response.status).toBe(404);
    });
}