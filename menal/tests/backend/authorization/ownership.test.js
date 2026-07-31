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
    it("does not allow user A to read user B's calendar", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const result = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 3, 0);

        const calendarId = Number(result.lastInsertRowid);

        // Expect A to not see B's calendar
        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .get(`/calendars/${calendarId}`);

        expect(nonOwnerResponse.status).toBe(404);

        // Expect B to see B's calendar
        const { agent: userBAgent } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .get(`/calendars/${calendarId}`);

        expect(ownerResponse.status).toBe(200);
    });

    it("does not allow user A to retrieve user B's calendar's colors", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        db.prepare(`
            INSERT INTO calendar_rating_colors (calendar_id, rating, color)
            VALUES (?, ?, ?)
        `).run(calendarId, 1, "#FFFFFF");

        // Expect A to not see B's colors
        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .get(`/calendars/${calendarId}/colors`);

        expect(nonOwnerResponse.status).toBe(404);

        // Expect B to see B's colors
        const { agent: userBAgent } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .get(`/calendars/${calendarId}/colors`);

        expect(ownerResponse.status).toBe(200);
    });

    it("does not allow user A to change user B's calendar name", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const result = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(result.lastInsertRowid);

        // Expect A to not change B's calendar name
        const { 
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .patch(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", userACsrfToken)
            .send({
                name: "Hacked Calendar",
            });

        expect(nonOwnerResponse.status).toBe(404);

        // Expect B to change B's calendar name
        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .patch(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", userBCsrfToken)
            .send({
                name: "New Name",
            });

        expect(ownerResponse.status).toBe(200);
    });

    it("does not allow user A to change user B's calendar colors", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        db.prepare(`
            INSERT INTO calendar_rating_colors (calendar_id, rating, color)
            VALUES (?, ?, ?)
        `).run(calendarId, 1, "#FFFFFF");

        // Expect user A to not change user B's calendar color
        const { 
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .put(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", userACsrfToken)
            .send({
                colors: ["#000000"],
            });

        expect(nonOwnerResponse.status).toBe(404);

        // Expect user B to change user B's calendar color
        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .put(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", userBCsrfToken)
            .send({
                colors: ["#000000"],
            });

        expect(ownerResponse.status).toBe(200);
    });
}

async function createDummyUsers(getDb) {
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

    return {userA, userB};
}