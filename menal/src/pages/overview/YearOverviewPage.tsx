import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useCalendars from "../../hooks/useCalendars";

import "/src/pages/overview/OverviewPage.css";

import type { JournalEntry, Entry } from "../../types";

function YearOverViewPage() {
    const navigate = useNavigate();

    const { year } = useParams();
    const { calendarColors } = useCalendars();

    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/overview/${year}/journal_entries`)
            .then((res) => res.json())
            .then((data) => setJournalEntries(data))
            .catch((err) => console.log(err));
    }, [year]);

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/overview/${year}/entries`)
            .then((res) => res.json())
            .then((data) => setEntries(data))
            .catch((err) => console.log(err));
    }, [year]);

    const groupedJournalEntries = groupEntriesByWeek(journalEntries);
    const journalWeeks = Object.keys(groupedJournalEntries).map(Number).sort((a, b) => a - b);

    const groupedEntries = groupEntriesByWeek(entries);

    const [openWeek, setOpenWeek] = useState<number | null>(null);

    return (
        <div className="year-overview-page">
            <h1
                className="over-view-back-button"
                onClick={() => navigate("/overview")}
            >
                Oversikt/{year}
            </h1>
            {journalWeeks.map((week) => (
                <div key={week} className="week-container">
                    <button
                        className={`week-button ${openWeek === week ? "active" : ""}`}
                        onClick={() => {
                            setOpenWeek(openWeek === week ? null : week)
                        }}
                    >
                        Uke {week}
                    </button>

                    {openWeek == week && (
                        <div className="week-entries">
                            {groupedJournalEntries[week].map((journalEntry) => (
                                <div key={journalEntry.date} className="journal-entry">
                                    <div className="journal-content">
                                        <h4>{journalEntry.date}</h4>
                                        <p>{journalEntry.journal_text}</p>
                                    </div>

                                    <div className="journal-actions">
                                        <button
                                            className="edit-journal-button"
                                            onClick={() => navigate(`/log/${journalEntry.date}`)}
                                        >
                                            ✎
                                        </button>
                                        <div className="overview-ratings">
                                            {(groupedEntries[week] ?? [])
                                                .filter((entry) => entry.date === journalEntry.date)
                                                .map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className="overview-rating-box"
                                                        style={{
                                                            backgroundColor:
                                                                calendarColors[entry.calendar_id]?.[entry.rating-1] ?? "gray"
                                                        }}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function groupEntriesByWeek<T extends {date: string}>(entries: T[]): Record<number, T[]> {
    const grouped: Record<number, T[]> = {};

    entries.forEach((entry) => {
        const week = getISOWeekNumber(entry.date);

        if (!grouped[week]) {
            grouped[week] = [];
        }

        grouped[week].push(entry);
    });

    return grouped;
}

function getISOWeekNumber(dateString: string) {
    const date = new Date(dateString + "T00:00:00");

    date.setHours(0, 0, 0, 0);

    date.setDate(
        date.getDate() + 3 - ((date.getDay() + 6) % 7)
    );

    const week1 = new Date(date.getFullYear(), 0, 4);

    return 1 + Math.round(
        (
            (date.getTime() - week1.getTime()) / 86400000
            - 3
            + ((week1.getDay() + 6) % 7)
        ) / 7
    );
}

export default YearOverViewPage;