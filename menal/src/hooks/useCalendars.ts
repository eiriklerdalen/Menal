import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import type { Calendar } from "../types";

function useCalendars() {
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [calendarColors, setCalendarColors] = useState<Record<number, string[]>>({});

    useEffect(() => {
        fetch(apiURL("/calendars"), {
            credentials: "include",
        })
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
    return fetch(apiURL(`/calendars/${calendarId}/colors`), {
        credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default useCalendars;