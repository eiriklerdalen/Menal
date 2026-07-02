import { useEffect, useState } from "react";

import { apiURL } from "../../config/api";
import useCalendars from "../../hooks/useCalendars";
import { periods, getPeriodDates } from "../../utils/periods";


function AverageRatingPanel() {

    const { calendars } = useCalendars();
    const [selectedCalendarId, setSelectedCalendarId] = useState<number | null>(null);
    useEffect(() => {
        if (calendars.length > 0 && selectedCalendarId === null) {
            setSelectedCalendarId(calendars[0].id);
        }
    }, [calendars, setSelectedCalendarId]);

    const selectedCalendar = calendars.find(
        (calendar) => calendar.id === selectedCalendarId
    );

    const [selectedPeriod, setSelectedPeriod] = useState<string>("week");
    const { from, to } = getPeriodDates(selectedPeriod);


    const [average, setAverage] = useState<number | null>(null);
    const [count, setCount] = useState(0);
    useEffect(() => {
        async function loadAverage() {
            if (selectedCalendarId === null) return;

            const result = await getAverageRating(selectedCalendarId, from, to);

            setAverage(result.average);
            setCount(result.count);
        }

        loadAverage();
    }, [selectedCalendarId, selectedPeriod]);

    return (
        <div className="average-rating-section">
            <h4>Gjennomsnittsrating</h4>
            <div className="average-parameters">
                <select
                    className="parameter-selector"
                    value={selectedCalendarId ?? ""}
                    onChange={(e) => setSelectedCalendarId(Number(e.target.value))}
                >
                    {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                            {calendar.name}
                        </option>
                    ))}
                </select>
                <select
                    className="parameter-selector"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                    {periods.map((p) => (
                        <option key={p.value} value={p.value}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="average-stat-row">
                <span>Gjennomsnitt:</span>
                <span>
                    {average !== null && selectedCalendar
                        ? `${Math.round(average * 100) / 100}/${selectedCalendar.max_rating}`
                        : "Ingen data"
                    }
                </span>
            </div>
            <div className="average-stat-row">
                <span>Entries i perioden:</span>
                <span>{count}</span>
            </div>
        </div>
    )
}

async function getAverageRating(calendarId: number, from: string, to: string) {
    const res = await fetch(
        apiURL(`/profiles/1/calendars/${calendarId}/average?from=${from}&to=${to}`)
    );

    if (!res.ok) {
        throw new Error("Failed to fetch average rating");
    }

    return res.json();
}

export default AverageRatingPanel;