import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../helpers/createTestApp.js";
import { createTestUser } from "../helpers/createTestUser.js";
import { createAuthenticatedAgent } from "../helpers/createAuthenticatedAgent.js";
import { MAX_NUM_CALENDARS } from "../../../src/backend/routes/calendars.routes.js";
import { NUM_MAX_ENTRIES } from "../../../src/backend/routes/entries.routes.js";
import { MAX_NUM_JOURNALS } from "../../../src/backend/routes/journal.routes.js";

describe("functional CRUD behavior", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    testCalendarBehavior(
        () => app,
        () => db,
    );

    testEntryBehavior(
        () => app,
        () => db,
    );

    testJournalBehavior(
        () => app,
        () => db,
    );

    testAverageBehavior(
        () => app,
        () => db,
    );
});

function testCalendarBehavior(getApp, getDb) {
    it("assigns increasing positions when creating calendars", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const firstResponse = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "First Calendar",
                max_rating: 3,
            });

        const secondResponse = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "Second Calendar",
                max_rating: 5,
            });

        expect(firstResponse.status).toBe(201);
        expect(secondResponse.status).toBe(201);
        expect(firstResponse.body.position).toBe(0);
        expect(secondResponse.body.position).toBe(1);

        const calendarsResponse = await agent.get("/calendars");

        expect(calendarsResponse.status).toBe(200);
        expect(calendarsResponse.body).toHaveLength(2);
        expect(calendarsResponse.body.map((calendar) => calendar.position)).toEqual([
            0,
            1,
        ]);
    });

    it("rejects creating a calendar when the user has reached the limit", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();

        for (let position = 0; position < MAX_NUM_CALENDARS; position += 1) {
            db.prepare(`
                INSERT INTO calendars (user_id, name, max_rating, position)
                VALUES (?, ?, ?, ?)
            `).run(user.id, `Calendar ${position + 1}`, 3, position);
        }

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "One Calendar Too Many",
                max_rating: 3,
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error: "Maximum number of calendars has been reached",
        });

        const { count } = db.prepare(`
            SELECT COUNT(*) AS count
            FROM calendars
            WHERE user_id = ?
        `).get(user.id);

        expect(count).toBe(MAX_NUM_CALENDARS);
    });

    it("deletes a calendar with its entries and colors", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();

        const calendarId = createCalendar(db, user.id, 2);

        db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)
        `).run(calendarId, "2026-08-01", 2);

        db.prepare(`
            INSERT INTO calendar_rating_colors (calendar_id, rating, color)
            VALUES (?, ?, ?), (?, ?, ?)
        `).run(
            calendarId, 1, "#FFFFFF",
            calendarId, 2, "#000000",
        );

        const response = await agent
            .delete(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", csrfToken);

        expect(response.status).toBe(200);

        const calendar = db.prepare(`
            SELECT *
            FROM calendars
            WHERE id = ?
        `).get(calendarId);

        const entries = db.prepare(`
            SELECT *
            FROM entries
            WHERE calendar_id = ?
        `).all(calendarId);

        const colors = db.prepare(`
            SELECT *
            FROM calendar_rating_colors
            WHERE calendar_id = ?
        `).all(calendarId);

        expect(calendar).toBeUndefined();
        expect(entries).toEqual([]);
        expect(colors).toEqual([]);
    });
}

function testEntryBehavior(getApp, getDb) {
    it("updates an existing entry instead of creating a duplicate", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();

        const calendarId = createCalendar(db, user.id, 5);
        const date = "2026-08-01";

        const createResponse = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date,
                rating: 2,
            });

        const updateResponse = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date,
                rating: 4,
            });

        expect(createResponse.status).toBe(200);
        expect(updateResponse.status).toBe(200);

        const entries = db.prepare(`
            SELECT *
            FROM entries
            WHERE calendar_id = ?
            AND date = ?
        `).all(calendarId, date);

        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({
            calendar_id: calendarId,
            date,
            rating: 4,
        });
    });

    it("rejects a new entry when the calendar has reached the entry limit", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();
        const calendarId = createCalendar(db, user.id, 5);
        const firstDate = "2025-01-01";

        const insertEntry = db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)
        `);

        const fillCalendar = db.transaction(() => {
            const startDate = new Date(`${firstDate}T00:00:00Z`);

            for (let index = 0; index < NUM_MAX_ENTRIES; index += 1) {
                const date = new Date(startDate);
                date.setUTCDate(startDate.getUTCDate() + index);
                insertEntry.run(calendarId, date.toISOString().slice(0, 10), 3);
            }
        });

        fillCalendar();

        const createResponse = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date: "2026-01-01",
                rating: 4,
            });

        expect(createResponse.status).toBe(409);
        expect(createResponse.body).toEqual({
            error: "Maximum number of entries for calendar has been reached.",
        });

        const updateResponse = await agent
            .post("/entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                calendar_id: calendarId,
                date: firstDate,
                rating: 5,
            });

        expect(updateResponse.status).toBe(200);

        const { count } = db.prepare(`
            SELECT COUNT(*) AS count
            FROM entries
            WHERE calendar_id = ?
        `).get(calendarId);

        expect(count).toBe(NUM_MAX_ENTRIES);
    });
}

function testJournalBehavior(getApp, getDb) {
    it("updates an existing journal entry instead of creating a duplicate", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();

        const date = "2026-08-01";

        const createResponse = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date,
                journal_text: "First text",
            });

        const updateResponse = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date,
                journal_text: "Updated text",
            });

        expect(createResponse.status).toBe(200);
        expect(updateResponse.status).toBe(200);

        const journalEntries = db.prepare(`
            SELECT *
            FROM journal_entries
            WHERE user_id = ?
            AND date = ?
        `).all(user.id, date);

        expect(journalEntries).toHaveLength(1);
        expect(journalEntries[0]).toMatchObject({
            user_id: user.id,
            date,
            journal_text: "Updated text",
        });
    });

    it("rejects a new journal entry when the user has reached the journal limit", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);
        const db = getDb();
        const firstDate = "2025-01-01";

        const insertJournal = db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)
        `);

        const fillJournals = db.transaction(() => {
            const startDate = new Date(`${firstDate}T00:00:00Z`);

            for (let index = 0; index < MAX_NUM_JOURNALS; index += 1) {
                const date = new Date(startDate);
                date.setUTCDate(startDate.getUTCDate() + index);
                insertJournal.run(
                    user.id,
                    date.toISOString().slice(0, 10),
                    `Journal ${index + 1}`,
                );
            }
        });

        fillJournals();

        const createResponse = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date: "2026-01-01",
                journal_text: "One journal too many",
            });

        expect(createResponse.status).toBe(409);
        expect(createResponse.body).toEqual({
            error: "Maximum number of journal entries has been reached.",
        });

        const updateResponse = await agent
            .post("/journal_entries")
            .set("X-CSRF-Token", csrfToken)
            .send({
                date: firstDate,
                journal_text: "Updated while at the limit",
            });

        expect(updateResponse.status).toBe(200);

        const { count } = db.prepare(`
            SELECT COUNT(*) AS count
            FROM journal_entries
            WHERE user_id = ?
        `).get(user.id);

        expect(count).toBe(MAX_NUM_JOURNALS);
    });
}

function testAverageBehavior(getApp, getDb) {
    it("calculates average and count from rated entries in the date interval", async () => {
        const { agent, user } = await createTestAgent(getApp, getDb);
        const db = getDb();

        const calendarId = createCalendar(db, user.id, 5);

        const insertEntry = db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)
        `);

        insertEntry.run(calendarId, "2026-08-01", 1);
        insertEntry.run(calendarId, "2026-08-02", 3);
        insertEntry.run(calendarId, "2026-08-03", 0);
        insertEntry.run(calendarId, "2026-08-04", 5);

        const response = await agent.get(
            `/calendars/${calendarId}/average?from=2026-08-01&to=2026-08-03`,
        );

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            calendarId,
            from: "2026-08-01",
            to: "2026-08-03",
            average: 2,
            count: 2,
        });
    });

    it("returns empty statistics when the calendar has no entries in the interval", async () => {
        const { agent, user } = await createTestAgent(getApp, getDb);
        const calendarId = createCalendar(getDb(), user.id, 5);

        const response = await agent.get(
            `/calendars/${calendarId}/average?from=2026-08-01&to=2026-08-31`,
        );

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            calendarId,
            from: "2026-08-01",
            to: "2026-08-31",
            average: null,
            count: 0,
        });
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
