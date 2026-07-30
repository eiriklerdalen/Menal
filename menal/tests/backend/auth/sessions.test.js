import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { createTestApp } from "../helpers/createTestApp";

import { getCsrfAgent } from "../helpers/createCsrfAgent";

describe("sessions", () => {
    let app;
    let db;

    beforeEach(() => {
        ({ app, db } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    it("returns 401 when /me is called without a session", async () => {
        const response = await request(app).get("/me");

        expect(response.status).toBe(401);
    });
})