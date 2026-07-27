export function badRequest(res, message="Invalid input.") {
    return res.status(400).json({ error: message });
}

export function unauthorizedLogin(res) {
    return res.status(401).json({ error: "Invalid email or password."});
}