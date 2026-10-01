import { apiURL } from "./api";
import { clearCSRFToken, getCSRFToken } from "./csrf";

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

    const response = await fetch(apiURL(path), {
        ...options,
        method,
        headers,
        credentials: "include",
    });

    if (response.status === 401) {
        const data = await response.clone().json()

        if (data?.code === "SESSION_REQUIRED" && path !== "/me") {
            clearCSRFToken();
            window.location.assign("/login");
        }
    }

    return response;
}