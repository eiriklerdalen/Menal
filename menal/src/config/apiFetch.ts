import { apiURL } from "./api";
import { getCSRFToken } from "./csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function apiFetch(path: string, options: RequestInit = {}) {
    const method = (options.method ?? "GET").toUpperCase();
    const headers = new Headers(options.headers);

    if (!SAFE_METHODS.has(method)) {
        headers.set(
            "X-CSRF-Token",
            await getCSRFToken()
        );
    }

    return fetch(apiURL(path), {
        ...options,
        method,
        headers,
        credentials: "include",
    });
}