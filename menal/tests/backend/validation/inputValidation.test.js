import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../helpers/createTestApp.js";
import { createTestUser } from "../helpers/createTestUser.js";
import { createAuthenticatedAgent } from "../helpers/createAuthenticatedAgent.js";

describe("input validation", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    testCalendarsInputValidation(
        () => app,
        () => db,
    );

    testEntriesInputValidation(
        () => app,
        () => db,
    );

    testJournalInputValidation(
        () => app,
        () => db,
    );

    testOverviewInputValidation(
        () => app,
        () => db,
    );
});

function testCalendarsInputValidation(getApp, getDb) {
    it("does not accept an invalid calendar id", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const response = await agent.get("/calendars/not-an-id");

        expect(response.status).toBe(400);
    });

    it("does not accept an empty calendar name", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "   ",
                max_rating: 3,
            });

        expect(response.status).toBe(400);
    });

    it("does not accept a calendar name longer than 50 characters", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "a".repeat(51),
                max_rating: 3,
            });

        expect(response.status).toBe(400);
    });

    it("does not accept an invalid max rating", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "Test Calendar",
                max_rating: 8,
            });

        expect(response.status).toBe(400);
    });

    it("does not accept invalid calendar colors", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 1);

        const response = await agent
            .post(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", csrfToken)
            .send({
                colors: ["not-a-color"],
            });

        expect(response.status).toBe(400);
    });

    it("does not accept the wrong number of calendar colors", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 2);

        const response = await agent
            .post(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", csrfToken)
            .send({
                colors: ["#FFFFFF"],
            });

        expect(response.status).toBe(400);
    });

    it("does not accept an invalid date interval for average", async () => {
        const { agent, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 1);

        const response = await agent.get(
            `/calendars/${calendarId}/average?from=2026-08-02&to=2026-08-01`,
        );

        expect(response.status).toBe(400);
    });
}

function testEntriesInputValidation(getApp, getDb) {
    it("does not accept an invalid entry date", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 3);

        const response = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date: "2026-02-30",
                rating: 1,
            });

        expect(response.status).toBe(400);
    });

    it("does not accept a rating higher than the calendar's max rating", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 3);

        const response = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date: "2026-08-01",
                rating: 4,
            });

        expect(response.status).toBe(400);
    });

    it("does not accept an invalid date when retrieving entries", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const response = await agent.get("/entries/invalid-date");

        expect(response.status).toBe(400);
    });
}

function testJournalInputValidation(getApp, getDb) {
    it("does not accept an invalid journal date", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date: "2026-13-01",
                journal_text: "Test text",
            });

        expect(response.status).toBe(400);
    });

    it("does not accept a journal text longer than 10000 characters", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date: "2026-08-01",
                journal_text: "a".repeat(10_001),
            });

        expect(response.status).toBe(400);
    });

    it("does not accept an invalid date when retrieving a journal entry", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const response = await agent.get("/journal_entries/invalid-date");

        expect(response.status).toBe(400);
    });
}

function testOverviewInputValidation(getApp, getDb) {
    it("does not accept an invalid overview year", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const journalResponse = await agent.get(
            "/overview/invalid-year/journal_entries",
        );

        const entriesResponse = await agent.get(
            "/overview/invalid-year/entries",
        );

        expect(journalResponse.status).toBe(400);
        expect(entriesResponse.status).toBe(400);
    });
}

async function createTestAgent(getApp, getDb) {
    const user = await createTestUser(
        getDb(),
        "Test User",
        "test@test.com",
        "password123",
    );

    const { agent, csrfToken } = await createAuthenticatedAgent(
        getApp(),
        user,
    );

    return { agent, csrfToken, user };
}

function createCalendar(db, userId, maxRating) {
    const calendar = db.prepare(`
        INSERT INTO calendars (user_id, name, max_rating, position)
        VALUES (?, ?, ?, ?)
    `).run(userId, "Test Calendar", maxRating, 0);

    return Number(calendar.lastInsertRowid);
}
