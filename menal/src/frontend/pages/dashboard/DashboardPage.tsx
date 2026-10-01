import useRequiredUser from "../../hooks/useRequiredUser.tsx";
import useCalendars from "../../hooks/useCalendars.ts";
import useEntries from "../../hooks/useEntries.ts";

import { getDate, getDateWriting } from "../../utils/date.ts";

import TodayPanel from "./TodayPanel.tsx";
import StatisticsPanel from "./StatisticsPanel.tsx";
import AverageRatingPanel from "./AverageRatingPanel.tsx";

import "./DashboardPage.css";

function DashboardPage() {
    const user = useRequiredUser();
    const name = user.name;

    const date = getDate();

    const { calendars, calendarColors } = useCalendars();
    const { entries } = useEntries(date);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Velkommen tilbake, { name }</h1>
                <p>{getDateWriting(new Date(), true)}</p>
            </div>
                <div className="dashboard-content">
                <TodayPanel
                    date={ date }
                    calendars={ calendars }
                    entries={ entries }
                    calendarColors={ calendarColors }
                />
                <StatisticsPanel />
                <AverageRatingPanel/>
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