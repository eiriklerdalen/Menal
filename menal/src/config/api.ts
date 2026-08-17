export const API_BASE_URL = import.meta.env.DEV
    ? `http://${window.location.hostname}:3000/api`
    : "/api";

export function apiURL(path: string) {
    return `${API_BASE_URL}${path}`;
}
