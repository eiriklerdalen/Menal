export const API_BASE_URL = "http://10.0.0.76:3000";

export function apiURL(path: string) {
    return `${API_BASE_URL}${path}`;
}