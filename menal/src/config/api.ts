export const API_BASE_URL = `http://${window.location.hostname}:3000`

export function apiURL(path: string) {
    return `${API_BASE_URL}${path}`;
}