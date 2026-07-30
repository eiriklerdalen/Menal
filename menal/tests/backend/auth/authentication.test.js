import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { createTestApp } from "../helpers/createTestApp.js";

import { getCsrfAgent } from "../helpers/createCsrfAgent.js";
import { createTestUser } from "../helpers/createTestUser.js";

import bcrypt from "bcrypt";

describe("authentication", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    testValidateEmail(() => app);
    testValidatePassword(() => app);
    testValidateName(() => app);

    testValidateRegisterRoute(
        () => app,
        () => db,
    );

    testLogoutRoute(
        () => app,
        () => db,
    );

    testSuccessfulRegisterRoute(() => app);

    testSuccessfullLoginRoute(
        () => app,
        () => db,
    );

    testUnauthorizedLogin(
        () => app,
        () => db,
    );
});

function testValidateEmail(getApp) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 400 when /login is called when email is not a string", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: 123,
                password: "password",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /login receives email that is empty", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "",
                password: "password",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /login is called when email does not match pattern", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "email",
                password: "password",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /login receives email with more than 254 characters", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: `${"a".repeat(250)}@test.com`,
                password: "password",
            });
        
        expect(response.status).toBe(400);
    });
}

function testValidatePassword(getApp) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });


    it("returns 400 when /login receives password that is not a string", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                password: 123
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /login receives password that is empty", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                password: "",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /login receives password with length greater than 128 character", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                password: `${"a".repeat(129)}`,
            });
        
        expect(response.status).toBe(400);
    });
}

function testValidateName(getApp) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });
    
    it("returns 400 when /register receives name that is a string", async () => {
        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                name: 123,
                password: "password",
                confirmPassword: "password",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /register receives name that is empty", async () => {
        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                name: "",
                password: "password",
                confirmPassword: "passord",
            });

        expect(response.status).toBe(400);
    });

    it("returns 400 when /register receives a name with more than 50 characters", async () => {
        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                name: `${"a".repeat(51)}`,
                password: "password",
                confirmPassword: "passord",
            });

        expect(response.status).toBe(400);
    });
}

function testValidateRegisterRoute(getApp, getDb) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 400 when /register receives two passwords that do not match", async () => {
        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                name: "test",
                password: "password",
                confirmPassword: "wordpass",
            });

        expect(response.status).toBe(400);
    });

    it("returns 409 when /register receives email that is already registered", async () => {
        const duplicateEmail = "existing@test.com";

        const user = await createTestUser(
            getDb(),
            "Test User",
            duplicateEmail,
            "password123",
        );

        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: duplicateEmail,
                name: "test",
                password: "password",
                confirmPassword: "password",
            });
        
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Email adress already registered.");
    });
}

function testLogoutRoute(getApp, getDb) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 204 if logout was successful", async () => {
        const user = await createTestUser(
            getDb(),
            "Test User",
            "test@test.com",
            "password123",
        );

        const loginResponse = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: user.email,
                password: user.password,
            });

        expect(loginResponse.status).toBe(200);

        const beforeLogout = await agent.get("/me");
        expect(beforeLogout.status).toBe(200);

        const csrfResponse = await agent.get("/csrf-token");
        const logoutCsrfToken = csrfResponse.body.csrfToken;

        const logoutResponse = await agent
            .post("/logout")
            .set("X-CSRF-Token", logoutCsrfToken);

        expect(logoutResponse.status).toBe(204);

        const afterLogout = await agent.get("/me");
        expect(afterLogout.status).toBe(401);
    });
}

function testSuccessfulRegisterRoute(getApp) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 201 if user was successfully registered", async () => {
        const response = await agent
            .post("/register")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "test@test.com",
                name: "test",
                password: "password123",
                confirmPassword: "password123",
            });

        expect(response.status).toBe(201);

        const meResponse = await agent.get("/me");

        expect(meResponse.status).toBe(200);
        expect(meResponse.body).toMatchObject({
            name: "test",
            email: "test@test.com",
        });
        expect(meResponse.body).not.toHaveProperty("password_hash");
    });
}

function testSuccessfullLoginRoute(getApp, getDb) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 200 when /login was successfull", async () => {
        const user = await createTestUser(
            getDb(),
            "Test User",
            "test@test.com",
            "password123",
        );

        const loginResponse = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: user.email,
                password: user.password,
            });

        expect(loginResponse.status).toBe(200);

        const meResponse = await agent.get("/me");

        expect(meResponse.status).toBe(200);
        expect(meResponse.body).toMatchObject({
            name: user.name,
            email: user.email,
        });
        expect(meResponse.body).not.toHaveProperty("password_hash");
    });
}

function testUnauthorizedLogin(getApp, getDb) {
    let agent;
    let csrfToken;

    beforeEach(async () => {
        ({ agent, csrfToken } = await getCsrfAgent(getApp()));
    });

    it("returns 401 when /login is called with an unknown email adress", async () => {
        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: "unknown@email.com",
                password: "password123",
            });

        expect(response.status).toBe(401);
    });

    it("returns 401 when /login is called with known email, but wrong password", async () => {
        const email = "known@email.com";

        const user = await createTestUser(
            getDb(),
            "Test User",
            email,
            "password",
        );

        const response = await agent
            .post("/login")
            .set("X-CSRF-Token", csrfToken)
            .send({
                email: email,
                password: "wordpass"
            });

        expect(response.status).toBe(401);
    });
}