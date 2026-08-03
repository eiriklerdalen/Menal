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

    testEntriesOwnership(
        () => app,
        () => db,
    );

    testJournalOwnership(
        () => app,
        () => db,
    );

    testOverviewOwnership(
        () => app,
        () => db,
    );
});

function testCalendarsOwnership(getApp, getDb) {
    it("only returns calendars owned by the authenticated user", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendarA = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userA.id, "User A Calendar", 1, 0);

        const calendarB = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "User B Calendar", 1, 0);

        const calendarAId = Number(calendarA.lastInsertRowid);
        const calendarBId = Number(calendarB.lastInsertRowid);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent.get("/calendars");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(calendarAId);
        expect(response.body[0].user_id).toBe(userA.id);
        expect(response.body.some(
            calendar => calendar.id === calendarBId
        )).toBe(false);
    });

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

    it("does not allow user A to add colors to user B's calendar", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        // Expect user A to not add colors to user B's calendar
        const {
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .post(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", userACsrfToken)
            .send({
                colors: ["#FFFFFF"],
            });

        expect(nonOwnerResponse.status).toBe(404);

        // Expect user B to add colors to user B's calendar
        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .post(`/calendars/${calendarId}/colors`)
            .set("X-CSRF-Token", userBCsrfToken)
            .send({
                colors: ["#FFFFFF"],
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

    it("does not allow user A to delete user B's calendar", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        const {
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        // Expect user A to not delete user B's calendar
        const nonOwnerResponse = await userAAgent
            .delete(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", userACsrfToken);

        expect(nonOwnerResponse.status).toBe(404);

        // Expect user B to delete user B's calendar
        const ownerResponse = await userBAgent
            .delete(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", userBCsrfToken);

        expect(ownerResponse.status).toBe(200);
    });

    it("only returns A's statistics, not B's", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const date = "2026-08-02";

        const db = getDb();

        const calendar = (userId, name, maxRating, position) => {
            return db.prepare(`
                INSERT INTO calendars (user_id, name, max_rating, position)
                VALUES (?, ?, ?, ?)
            `).run(userId, name, maxRating, position);
        }

        const calendarAId = Number(calendar(
            userA.id,
            "A calendar",
            1,
            1,
        ).lastInsertRowid);

        const calendarBId = Number(calendar(
            userB.id,
            "B calendar",
            1,
            1,
        ).lastInsertRowid);

        const entry = (calendarId, date, rating) => {
            db.prepare(`
                INSERT INTO entries (calendar_id, date, rating)
                VALUES (?, ?, ?)    
            `).run(calendarId, date, rating);
        }

        entry(calendarAId, date, 1);
        entry(calendarBId, date, 1);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const ownerResponse = await userAAgent.get(`/calendars/${calendarAId}/average?from=${date}&to=${date}`);

        expect(ownerResponse.status).toBe(200);
        expect(ownerResponse.body).toMatchObject({
           calendarId: calendarAId,
           from: date,
           to: date,
           average: 1,
           count: 1 
        });

        const nonOwnerResponse = await userAAgent.get(`/calendars/${calendarBId}/average?from=${date}&to=${date}`);

        expect(nonOwnerResponse.status).toBe(404);
    });
}

function testEntriesOwnership(getApp, getDb) {
    it("only returns entries owned by the authenticated user", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendarA = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userA.id, "User A Calendar", 1, 0);

        const calendarB = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "User B Calendar", 1, 0);

        const calendarAId = Number(calendarA.lastInsertRowid);
        const calendarBId = Number(calendarB.lastInsertRowid);

        const entryA = db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)
        `).run(calendarAId, "2020-03-12", 1);

        const entryB = db.prepare(`
            INSERT INTO entries (calendar_id, date, rating)
            VALUES (?, ?, ?)    
        `).run(calendarBId, "2020-03-12", 1);

        const entryAId = Number(entryA.lastInsertRowid);
        const entryBId = Number(entryB.lastInsertRowid);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent.get("/entries");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toMatchObject({
            id: entryAId,
            calendar_id: calendarAId,
            date: "2020-03-12",
            rating: 1,
        });

        expect(
            response.body.some(entry => entry.id === entryBId)
        ).toBe(false);
    });

    it("does not allow user A to post entry to user B's calendar", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        // Expect user A to not post to user B's calendar
        const { 
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent
            .post("/entries")
            .set("X-CSRF-Token", userACsrfToken)
            .send({
                calendar_id: calendarId,
                date: "2020-03-12",
                rating: 1,
            });

        expect(nonOwnerResponse.status).toBe(404);

        // Expect user B to post to user B's calendar
        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent
            .post("/entries")
            .set("X-CSRF-Token", userBCsrfToken)
            .send({
                calendar_id: calendarId,
                date: "2020-03-12",
                rating: 1,
            });

        expect(ownerResponse.status).toBe(200);
    });

    it("does not allow user A to delete an entry in user B's calendar", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)  
        `).run(userB.id, "Private Calendar", 1, 0);

        const calendarId = Number(calendar.lastInsertRowid);

        const { 
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const {
            agent: userBAgent,
            csrfToken: userBCsrfToken,
        } = await createAuthenticatedAgent(getApp(), userB);

        const date = "2020-03-12";

        const postResponse = await userBAgent
            .post("/entries")
            .set("X-CSRF-Token", userBCsrfToken)
            .send({
                calendar_id: calendarId,
                date: date,
                rating: 1,
            });
        
        expect(postResponse.status).toBe(200);

        // Expect user A to not delete user B's entry
        const nonOwnerResponse = await userAAgent
            .delete(`/entries/${calendarId}/${date}`)
            .set("X-CSRF-Token", userACsrfToken);

        expect(nonOwnerResponse.status).toBe(404);

        // Expect user B to delete user B's entry
        const csrfResponse = await userBAgent.get("/csrf-token");
        const userBNewCsrfToken = csrfResponse.body.csrfToken;

        const ownerResponse = await userBAgent
            .delete(`/entries/${calendarId}/${date}`)
            .set("X-CSRF-Token", userBNewCsrfToken);

        expect(ownerResponse.status).toBe(200);
    });

    it("only get A's entries for a given date, not B's", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const date = "2026-08-02";

        const db = getDb();

        const calendar = (userId, name, maxRating, position) => {
            return db.prepare(`
                INSERT INTO calendars (user_id, name, max_rating, position)
                VALUES (?, ?, ?, ?)    
            `).run(userId, name, maxRating, position);
        }

        const calendarAId = Number(calendar(
            userA.id,
            "A calendar",
            1,
            1,
        ).lastInsertRowid);

        const calendarBId = Number(calendar(
            userB.id,
            "B calendar",
            1,
            1,
        ).lastInsertRowid);

        const entry = (calendarId, date, rating) => {
            db.prepare(`
                INSERT INTO entries (calendar_id, date, rating)
                VALUES (?, ?, ?)
            `).run(calendarId, date, rating);
        }

        entry(calendarAId, date, 1);
        entry(calendarBId, date, 1);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent.get(`/entries/${date}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            calendar_id: calendarAId,
            date: date,
            rating: 1,
        });
    });
}

function testJournalOwnership(getApp, getDb) {
    it("only returns journals owned by the authenticated user", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const journal = (userId, journalText) => {
            db.prepare(`
                INSERT INTO journal_entries (user_id, date, journal_text)
                VALUES (?, ?, ?)    
            `).run(userId, "2026-07-31", journalText);
        }

        journal(userA.id, "User A text");
        journal(userB.id, "User B text");

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        // Expect user A to only see A's journal entry
        const response = await userAAgent.get("/journal_entries")

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toMatchObject({
            user_id: userA.id,
            date: "2026-07-31",
            journal_text: "User A text",
        });
    });

    it("only returns the authenticated user's journal entry for a date", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const date = "2026-07-31";

        const journal = db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userB.id, date, "User B text");

        // Expect user A not to see user B's journal entry
        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const nonOwnerResponse = await userAAgent.get(`/journal_entries/${date}`);

        expect(nonOwnerResponse.status).toBe(200);
        expect(nonOwnerResponse.body).toBeNull();

        // Expect user B to see user B's journal entry
        const { agent: userBAgent } = await createAuthenticatedAgent(getApp(), userB);

        const ownerResponse = await userBAgent.get(`/journal_entries/${date}`);

        expect(ownerResponse.status).toBe(200);
        expect(ownerResponse.body).toMatchObject({
            user_id: userB.id,
            date: date,
            journal_text: "User B text",
        });
    });

    it("posting A's journal does not change B's journal", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const date = "2026-08-01";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userB.id, date, "User B text");

        const {
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const postResponse = await userAAgent
            .post("/journal_entries")
            .set("X-CSRF-Token", userACsrfToken)
            .send({
                user_id: userB.id,
                date: date,
                journal_text: "User A text",
            });

        expect(postResponse.status).toBe(200);

        const getResponseA = await userAAgent.get(`/journal_entries/${date}`);

        expect(getResponseA.status).toBe(200);
        expect(getResponseA.body).toMatchObject({
            user_id: userA.id,
            date: date,
            journal_text: "User A text",
        });

        // User B's journal entry stays unedited
        const { agent: userBAgent } = await createAuthenticatedAgent(getApp(), userB);

        const getResponseB = await userBAgent.get(`/journal_entries/${date}`);

        expect(getResponseB.status).toBe(200);
        expect(getResponseB.body).toMatchObject({
            user_id: userB.id,
            date: date,
            journal_text: "User B text",
        });
    });

    it("deleting A's journal does not change B's journal", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const date = "2026-08-01";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userA.id, date, "User A text");

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userB.id, date, "User B text");

        const {
            agent: userAAgent,
            csrfToken: userACsrfToken,
        } = await createAuthenticatedAgent(getApp(), userA);

        const deleteResponse = await userAAgent
            .delete(`/journal_entries/${date}`)
            .set("X-CSRF-Token", userACsrfToken);

        expect(deleteResponse.status).toBe(200);

        const getResponseA = await userAAgent.get(`/journal_entries/${date}`);

        expect(getResponseA.status).toBe(200);
        expect(getResponseA.body).toBeNull();

        // B's journal should still exist
        const { agent: userBAgent } = await createAuthenticatedAgent(getApp(), userB);

        const getResponseB = await userBAgent.get(`/journal_entries/${date}`);

        expect(getResponseB.status).toBe(200);
        expect(getResponseB.body).toMatchObject({
            user_id: userB.id,
            date: date,
            journal_text: "User B text",
        });
    });
}

function testOverviewOwnership(getApp, getDb) {
    it("only returns years for user A, not B", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const db = getDb();

        const dateA = "2025-08-01";
        const dateB = "2026-08-01";

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)
        `).run(userA.id, dateA, "User A text");

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userB.id, dateB, "User B text");

        // A only gets 2025
        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const getResponseA = await userAAgent.get("/overview");

        expect(getResponseA.status).toBe(200);
        expect(getResponseA.body).toHaveLength(1);
        expect(getResponseA.body).toMatchObject([
            { year: "2025"},
        ]);
    });

    it("only returns A's journal_entries for a given year, not B's", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const year = 2026;
        const date = "2026-08-02";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userA.id, date, "User A text");

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(userB.id, date, "User B text");

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent.get(`/overview/${year}/journal_entries`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            user_id: userA.id,
            date: date,
            journal_text: "User A text",
        });
    });

    it("only returns A's entries for a given year, not B's", async () => {
        const { userA, userB } = await createDummyUsers(getDb);

        const year = 2026
        const date = "2026-08-02";

        const db = getDb();

        const calendar = (userId, name, maxRating, position) => {
            return db.prepare(`
                INSERT INTO calendars (user_id, name, max_rating, position)
                VALUES (?, ?, ?, ?)  
            `).run(userId, name, maxRating, position);
        }

        const calendarA = calendar(userA.id, "A calendar", 1, 1);
        const calendarB = calendar(userB.id, "B calendar", 1, 1);

        const calendarIdA = Number(calendarA.lastInsertRowid);
        const calendarIdB = Number(calendarB.lastInsertRowid);

        const entry = (calendarId, date, rating) => {
            db.prepare(`
                INSERT INTO entries (calendar_id, date, rating)
                VALUES (?, ?, ?)    
            `).run(calendarId, date, rating);
        }

        entry(calendarIdA, date, 1);
        entry(calendarIdB, date, 1);

        const { agent: userAAgent } = await createAuthenticatedAgent(getApp(), userA);

        const response = await userAAgent.get(`/overview/${year}/entries`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            calendar_id: calendarIdA,
            date: date,
            rating: 1,
        });
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