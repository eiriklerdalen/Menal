import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useCalendars from "../hooks/useCalendars";
import useEntries from "../hooks/useEntries";
import getDate from "../utils/date";

import "/src/pages/DashboardPage.css";

const profileId = 1;

function DashboardPage() {
    const navigate = useNavigate();
    const date = getDate();

    const { calendars, calendarColors } = useCalendars();
    const { entries, setEntries } = useEntries(date);

    const [name, setName] = useState<string>("");
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/${profileId}`)
            .then((res) => res.json())
            .then((data) => setName(data.name))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="dashboard">
            <h1>Velkommen tilbake, {name}</h1>

            <div className="today-section">
                <h4>I dag...</h4>
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
        </div>
    )
}

export default DashboardPage;

// ───────────────────────────────
// Good evening, Eirik

// Today
// ───────────────────────────────
// Journal           ✓
// Mood              5/6
// Sleep             4/6
// Training          —
// Productivity      6/6

// [Continue today's log]

// ───────────────────────────────
// Current streak: 17 days

// Journal entries: 184

// Calendars: 5

// ───────────────────────────────
// Latest journal

// 29 June

// Today was...