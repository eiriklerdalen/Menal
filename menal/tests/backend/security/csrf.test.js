import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../helpers/createTestApp";

import { createTestUser } from "../helpers/createTestUser";
import { createAuthenticatedAgent } from "../helpers/createAuthenticatedAgent";

describe("csrf security", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db} = createTestApp());
    })

    afterEach(() => {
        db.close();
    })

    testPostCsrf(
        () => app,
        () => db,
    );

    testPatchCsrf(
        () => app,
        () => db,
    );

    testDeleteCsrf(
        () => app,
        () => db,
    );
});

function testPostCsrf(getApp, getDb) {
    it("rejects POST requests with a missing CSRF token", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .send({
                name: "Test Calendar",
                max_rating: 5,
            });

        expect(response.status).toBe(403);

        // Check that calendar was not created
        const checkForUpdateResponse = await agent
            .get("/calendars");

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toEqual([])
    });

    it("rejects POST requests with an invalid CSRF token", async () => {
        const { agent } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", "invalid-csrf-token")
            .send({
                name: "Test Calendar",
                max_rating: 5,
            });
        
        expect(response.status).toBe(403);

        // Check that calendar was not created
        const checkForUpdateResponse = await agent
            .get("/calendars");

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject([])
    });

    it("accepts POST requests with valid CSRF token", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const response = await agent
            .post("/calendars")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "Test Calendar",
                max_rating: 5,
            });

        expect(response.status).toBe(201);

        // Check that calendar was created
        const checkForUpdateResponse = await agent
            .get("/calendars");

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject([{
            id: 1,
            user_id: 1,
            name: 'Test Calendar',
            max_rating: 5,
            position: 0,
            oldestEntryDate: null
        }]);    
    });
}

function testPatchCsrf(getApp, getDb) {
    it("rejects PATCH requests with a missing CSRF token", async () => {
        const { agent, user} = await createTestAgent(getApp, getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)
        `).run(user.id, "Test Calendar", 1, 1);

        const calendarId = Number(calendar.lastInsertRowid);

        const response = await agent
            .patch(`/calendars/${calendarId}`)
            .send({
                name: "New Calendar Name",
            });

        expect(response.status).toBe(403);

        // Check that name was not updated
        const checkForUpdateResponse = await agent
            .get(`/calendars/${calendarId}`);
        
        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject({
            id: 1,
            user_id: 1,
            name: "Test Calendar",
            max_rating: 1,
        });
    });

    it("rejects PATCH request with an invalid CSRF token", async () => {
        const { agent, user} = await createTestAgent(getApp, getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)
        `).run(user.id, "Test Calendar", 1, 1);

        const calendarId = Number(calendar.lastInsertRowid);

        const response = await agent
            .patch(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", "invalid-csrf-token")
            .send({
                name: "New Calendar Name",
            });

        expect(response.status).toBe(403);

        // Check that name was not updated
        const checkForUpdateResponse = await agent
            .get(`/calendars/${calendarId}`);
        
        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject({
            id: 1,
            user_id: 1,
            name: "Test Calendar",
            max_rating: 1,
        });
    });

    it("accepts PATCH requests with a valid CSRF token", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);

        const db = getDb();

        const calendar = db.prepare(`
            INSERT INTO calendars (user_id, name, max_rating, position)
            VALUES (?, ?, ?, ?)
        `).run(user.id, "Test Calendar", 1, 1);

        const calendarId = Number(calendar.lastInsertRowid);

        const response = await agent
            .patch(`/calendars/${calendarId}`)
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: "New Calendar Name",
            });

        expect(response.status).toBe(200);

        // Check that name was updated
        const checkForUpdateResponse = await agent
            .get(`/calendars/${calendarId}`);
        
        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject({
            id: 1,
            user_id: 1,
            name: "New Calendar Name",
            max_rating: 1,
        });
    });
}

function testDeleteCsrf(getApp, getDb) {
    it("rejects DELETE requests with a missing CSRF token", async () => {
        const { agent, user } = await createTestAgent(getApp, getDb);

        const date = "2026-08-02";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(user.id, date, "Test Text");

        const response = await agent.delete(`/journal_entries/${date}`);

        expect(response.status).toBe(403);

        // Check that journal was not deleted
        const checkForUpdateResponse = await agent
            .get(`/journal_entries/${date}`);

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject({ 
            id: 1, 
            user_id: 1, 
            date: '2026-08-02', 
            journal_text: 'Test Text' 
        });
    });

    it("rejects DELETE requests with an invalid CSRF token", async () => {
        const { agent, user } = await createTestAgent(getApp, getDb);

        const date = "2026-08-02";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(user.id, date, "Test Text");

        const response = await agent
            .delete(`/journal_entries/${date}`)
            .set("X-CSRF-Token", "invalid-csrf-token");

        expect(response.status).toBe(403);

        // Check that journal was not deleted
        const checkForUpdateResponse = await agent
            .get(`/journal_entries/${date}`);

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toMatchObject({ 
            id: 1, 
            user_id: 1, 
            date: '2026-08-02', 
            journal_text: 'Test Text' 
        });
    });

    it("accepts DELETE requests with a valid CSRF token", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);

        const date = "2026-08-02";

        const db = getDb();

        db.prepare(`
            INSERT INTO journal_entries (user_id, date, journal_text)
            VALUES (?, ?, ?)    
        `).run(user.id, date, "Test Text");

        const response = await agent
            .delete(`/journal_entries/${date}`)
            .set("X-CSRF-Token", csrfToken);

        expect(response.status).toBe(200);

        // Check that journal was deleted
        const checkForUpdateResponse = await agent
            .get(`/journal_entries/${date}`);

        expect(checkForUpdateResponse.status).toBe(200);
        expect(checkForUpdateResponse.body).toBeNull();
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