import { apiURL } from "./api";

let csrfToken: string | null = null;

export async function getCSRFToken() {
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
    csrfToken = data.csrfToken;

    return csrfToken;
}

export function clearCSRFToken() {
    csrfToken = null;
}