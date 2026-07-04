import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import useCurrentUser from "./useCurrentUser";

import type { Calendar } from "../types";

function useCalendars() {
    const { profileId } = useCurrentUser();

    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [calendarColors, setCalendarColors] = useState<Record<number, string[]>>({});

    useEffect(() => {
        fetch(apiURL(`/profiles/${profileId}/calendars`))
            .then((res) => res.json())
            .then((data) => setCalendars(data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        calendars.forEach((calendar) => {
            loadColors(profileId, calendar.id).then((colors) => {
                setCalendarColors((prev) => ({
                    ...prev,
                    [calendar.id]: colors,
                }));
            });
        });
    }, [calendars]);

    return { calendars, setCalendars, calendarColors };
}

async function loadColors(profileId: number, calendarId: number) {
    return fetch(apiURL(`/profiles/${profileId}/calendars/${calendarId}/colors`))
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default useCalendars;