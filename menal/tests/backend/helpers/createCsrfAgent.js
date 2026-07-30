import request from "supertest";

export async function getCsrfAgent(app) {
    const agent = request.agent(app);
    const csrfResponse = await agent.get("/csrf-token");

    return {
        agent,
        csrfToken: csrfResponse.body.csrfToken,
    };
}