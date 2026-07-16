import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiURL } from "../../config/api.js";
import type { Entry, Calendar } from "../../types.ts";

type TodayPanelProps = {
    date: string;
    calendars: Calendar[];
    entries: Entry[];
    calendarColors: Record<number, string[]>;
};

function TodayPanel({
    date,
    calendars,
    entries,
    calendarColors
}: TodayPanelProps) {
    const navigate = useNavigate();

    const [hasWritten, setHasWritten] = useState(false);
    useEffect(() => {
        hasWrittenLogToday(date).then(setHasWritten);
    }, [date]);

    return (
        <div className="card-section">
            <h4>I dag...</h4>

            <div className="calendar-rating-container">
                <p>Journal?</p>
                <div 
                    className="selected-rating"
                >
                    {hasWritten ? "✓" : "✕" }
                </div>
            </div>

            {calendars.map((calendar) => {
                const entry = entries.find(
                    (entry) => entry.calendar_id === calendar.id
                );

                return (
                    <div className="calendar-rating-container">
                        <p>{calendar.name}</p>
                        <div 
                            className="selected-rating"
                            style={{
                                backgroundColor:
                                    entry
                                    ? calendarColors[calendar.id]?.[entry.rating - 1] ?? "lightgray"
                                    : "lightgray"
                            }}
                        />
                    </div>
                )
            })}
            <div className="write-log-button">
                <button
                    onClick={() => navigate(`/log/${date}`)}
                >
                    Skriv dagens logg
                </button>
            </div>
        </div>
    )
}

async function hasWrittenLogToday(date: string) {
    const res = await fetch(apiURL(`/journal_entries/${date}`), {
        credentials: "include",
    });
    const entry = await res.json();

    return !!entry;
}

export default TodayPanel;