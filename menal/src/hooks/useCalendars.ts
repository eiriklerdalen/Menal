import { useEffect, useState } from "react";

import { apiFetch } from "../config/apiFetch";

import type { Calendar } from "../types";

function useCalendars() {
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [calendarColors, setCalendarColors] = useState<Record<number, string[]>>({});

    useEffect(() => {
        apiFetch("/calendars")
            .then((res) => res.json())
            .then((data) => setCalendars(data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        calendars.forEach((calendar) => {
            loadColors(calendar.id).then((colors) => {
                setCalendarColors((prev) => ({
                    ...prev,
                    [calendar.id]: colors,
                }));
            });
        });
    }, [calendars]);

    return { calendars, setCalendars, calendarColors };
}

async function loadColors(calendarId: number) {
    return apiFetch(`/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default useCalendars;