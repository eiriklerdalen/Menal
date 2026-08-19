const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_JOURNAL_LENGTH = 5_000;

export function areStrings(...values) {
    return values.every((value) => typeof value === "string");
}

export function validateCalendarId(calendarId) {
    return Number.isInteger(calendarId) && calendarId > 0;
}

export function validateDate(date) {
    if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    return (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day
    );
}

export function validateYear(year) {
    const yearPattern = /^\d{4}$/;
    return yearPattern.test(year);
}

export function validateName(name) {
    return (
        typeof name === "string" &&
        name.trim() !== "" && 
        name.trim().length <= 50
    );
}

export function validateColors(colors) {
    if (!Array.isArray(colors) || !colors.every((color) => typeof color === "string")) {
        return false;
    }

    const colorPattern = /^#[0-9A-Fa-f]{6}$/;
    if (!colors.every((color) => colorPattern.test(color))) {
        return false;
    }

    return true;
}

export function validateDateInterval(from, to) {
    return (
        validateDate(from) &&
        validateDate(to) &&
        from <= to
    );
}

export function validateEmail(email) {
    return (
        typeof email === "string" &&
        email !== "" &&
        EMAIL_PATTERN.test(email) &&
        email.length <= 254
    );
}

export function validatePassword(password) {
    return (
        typeof password === "string" &&
        password !== "" &&
        password.length <= 128 &&
        password.length >= 8
    );
}

export function validateMaxRating(maxRating) {
    return (
        Number.isInteger(maxRating) &&
        maxRating >= 1 &&
        maxRating <= 7
    );
}

export function validateRating(rating, maxRating) {
    return (
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= maxRating
    );
}

export function validateColorCount(colors, maxRating) {
    return colors.length === maxRating;
}

export function validateJournalText(text) {
    return (
        typeof text === "string" &&
        text.length <= MAX_JOURNAL_LENGTH
    );
}