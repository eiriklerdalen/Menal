import { apiURL } from "./api";

let csrfToken: string | null = null;

export async function getCSRFToken(): Promise<string> {
    if (csrfToken) {
        return csrfToken;
    }

    const response = await fetch(apiURL("/csrf-token"), {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Could not get CSRF token.");
    }

    const data = await response.json();
    const token = data.csrfToken;

    if (typeof data.csrfToken !== "string") {
        throw new Error("Invalid CSRF token response.");
    }

    csrfToken = data.csrfToken;

    return token;
}

export function clearCSRFToken() {
    csrfToken = null;
}