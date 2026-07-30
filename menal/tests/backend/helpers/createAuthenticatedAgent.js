import { request } from "supertest";

import { getCsrfAgent } from "./createCsrfAgent";

export async function createAuthenticatedAgent(app, user) {
    let agent;
    let csrfToken;

    ({ agent, csrfToken} = await getCsrfAgent(app));

    const loginResponse = await agent
        .post("/login")
        .set("X-CSRF-Token", csrfToken)
        .send({
            email: user.email,
            password: user.password,
        });

    if (loginResponse.status !== 200) {
        throw new Error(
            `Test user could not log in: ${loginResponse.status}`,
        );
    }

    const authenticatedCsrfResponse = await agent.get("/csrf-token");

    return {
        agent,
        csrfToken: authenticatedCsrfResponse.body.csrfToken
    };
}