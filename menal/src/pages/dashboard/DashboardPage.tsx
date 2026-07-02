import { useEffect, useState } from "react";

import useCalendars from "../../hooks/useCalendars.ts";
import useEntries from "../../hooks/useEntries.ts";

import { getDate, getDateWriting } from "../../utils/date.ts";

import TodayPanel from "./TodayPanel.tsx";
import StatisticsPanel from "./StatisticsPanel.tsx";
import AverageRatingPanel from "./AverageRatingPanel.tsx";

import "/src/pages/dashboard/DashboardPage.css";

const profileId = 1;

function DashboardPage() {
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
            <div className="dashboard-header">
                <h1>Velkommen tilbake, {name}</h1>
                <p>{getDateWriting(new Date())}</p>
            </div>
                <div className="dashboard-content">
                <TodayPanel
                    profileId={profileId}
                    date={date}
                    calendars={calendars}
                    entries={entries}
                    calendarColors={calendarColors}
                />
                <StatisticsPanel />
                <AverageRatingPanel />
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