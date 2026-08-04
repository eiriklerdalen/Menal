import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../helpers/createTestApp.js";
import { createTestUser } from "../helpers/createTestUser.js";
import { createAuthenticatedAgent } from "../helpers/createAuthenticatedAgent.js";

import bcrypt from "bcrypt";

describe("account", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    testNameChange(
        () => app,
        () => db,
    );

    testPasswordChange(
        () => app,
        () => db,
    );
});

function testNameChange(getApp, getDb) {
    it("valid name succeeds", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);

        const newName = "New Name";

        const response = await agent
            .patch("/account/name")
            .set("X-CSRF-Token", csrfToken)
            .send({
                name: newName,
            });

        expect(response.status).toBe(200);

        const meResponse = await agent.get("/me");

        expect(meResponse.status).toBe(200);
        expect(meResponse.body).toMatchObject({
            id: user.id,
            name: newName,
            email: user.email,
        });
    });
}

function testPasswordChange(getApp, getDb) {
    it("valid password succeeds", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);

        const oldPassword = "password123";
        const newPassword = "123password";

        const response = await agent
            .patch("/account/password")
            .set("X-CSRF-Token", csrfToken)
            .send({
                password: oldPassword,
                newPassword,
                confirmPassword: newPassword,
            });

        expect(response.status).toBe(204);

        const updatedUser = getDb().prepare(`
            SELECT password_hash
            FROM users
            WHERE id = ?
        `).get(user.id);

        expect(
            await bcrypt.compare(newPassword, updatedUser.password_hash)
        ).toBe(true);

        expect(
            await bcrypt.compare(oldPassword, updatedUser.password_hash)
        ).toBe(false);
    });

    it("wrong current password does not change password", async () => {
        const { agent, csrfToken, user } = await createTestAgent(getApp, getDb);

        const wrongPassword = "wrongPassword";
        const newPassword = "newPassword";

        const userBefore = getDb().prepare(`
            SELECT password_hash
            FROM users
            WHERE id = ?    
        `).get(user.id);

        const response = await agent
            .patch("/account/password")
            .set("X-CSRF-Token", csrfToken)
            .send({
                password: wrongPassword,
                newPassword,
                confirmPassword: newPassword,
            });

        expect(response.status).toBe(401);

        const notUpdatedUser = getDb().prepare(`
            SELECT password_hash
            FROM users
            WHERE id = ?    
        `).get(user.id);

        expect(notUpdatedUser.password_hash).toBe(userBefore.password_hash);

        expect(
            await bcrypt.compare(user.password, notUpdatedUser.password_hash)
        ).toBe(true);

        expect(
            await bcrypt.compare(newPassword, notUpdatedUser.password_hash)
        ).toBe(false);
    });

    it("rejects non-identical confirm password", async () => {
        const { agent, csrfToken } = await createTestAgent(getApp, getDb);

        const oldPassword = "password123";
        const newPassword = "123password";
        const confirmPassword = "1234password";

        const response = await agent
            .patch("/account/password")
            .set("X-CSRF-Token", csrfToken)
            .send({
                password: oldPassword,
                newPassword,
                confirmPassword,
            });

        expect(response.status).toBe(400);
    })
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