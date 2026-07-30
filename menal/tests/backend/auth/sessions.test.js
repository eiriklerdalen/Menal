import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { createTestApp } from "../helpers/createTestApp";

import { getCsrfAgent } from "../helpers/createCsrfAgent";
import { createTestUser } from "../helpers/createTestUser";

describe("sessions", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(app));
    })

    afterEach(() => {
        db.close();
    });

    it("returns 401 when /me is called without a session", async () => {
        const response = await agent
            .get("/me");

        expect(response.status).toBe(401);
    });

    it("checks if session-id changes when logging in", async () => {
        const agent = request.agent(app)
        const csrfResponse = await agent.get("/csrf-token");
        const csrfToken = csrfResponse.body.csrfToken;
        const sessionBeforeLogin = getSessionCookie(csrfResponse);

        const name = "Test User"
        const email = "test@test.com"
        const password = "password123"

        const user = await createTestUser(
            db,
            name,
            email,
            password,
        );

        const loginResponse = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: email,
                password: password,
            });

        const sessionAfterLogin = getSessionCookie(loginResponse);

        expect(loginResponse.status).toBe(200);
        expect(sessionBeforeLogin).toBeDefined();
        expect(sessionAfterLogin).toBeDefined();
        expect(sessionAfterLogin).not.toBe(sessionBeforeLogin);
    });

    it("checks if old cookie does not work after logout", async () => {
        const name = "Test User"
        const email = "test@test.com"
        const password = "password123"

        const user = await createTestUser(
            db,
            name,
            email,
            password,
        );

        const loginResponse = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: email,
                password: password,
            });
        
        expect(loginResponse.status).toBe(200);

        const oldSessionCookie = getSessionCookie(loginResponse);

        const csrfResponse = await agent.get("/csrf-token");
        const logoutCsrfToken = csrfResponse.body.csrfToken;

        const logoutResponse = await agent
            .post("/logout")
            .set("X-CSRF-Token", logoutCsrfToken);

        expect(logoutResponse.status).toBe(204);

        const meResponse = await request(app)
            .get("/me")
            .set("Cookie", oldSessionCookie);

        expect(meResponse.status).toBe(401);
    });

    it("keeps the Redis session when Express is recreate", async () => {
        const user = await createTestUser(
            db,
            "Test User",
            "test@test.com",
            "password123"
        );

        const loginResponse = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: user.email,
                password: user.password,
            });

        expect(loginResponse.status).toBe(200);

        const sessionCookie = getSessionCookie(loginResponse);
        expect(sessionCookie).toBeDefined();

        const { app: restartedApp } = createTestApp({ db });

        const meResponse = await request(restartedApp)
            .get("/me")
            .set("Cookie", sessionCookie);

        expect(meResponse.status).toBe(200);
        expect(meResponse.body).toMatchObject({
            name: user.name,
            email: user.email,
        });
    });
});

function getSessionCookie(response) {
    const setCookie = response.header["set-cookie"] ?? [];

    return setCookie
        .find((cookie) => cookie.startsWith("connect.sid="))
        ?.split(";")[0];
}