import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useCalendars from "../../hooks/useCalendars";

import "/src/pages/overview/YearOverviewPage.css";

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
            <h1>Oversikt/{year}</h1>
            {journalWeeks.map((week) => (
                <div className="week-container">
                    <button
                        className="week-button"
                        onClick={() =>
                            setOpenWeek(openWeek === week ? null : week)
                        }
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

function getWeekNumber(dateString: string) {
    const date = new Date(dateString);
    const startOfYear = new Date(date.getFullYear(), 0, 1);

    const diffInDays = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.floor(diffInDays / 7) + 1;
}

function groupEntriesByWeek<T extends {date: string}>(entries: T[]): Record<number, T[]> {
    const grouped: Record<number, T[]> = {};

    entries.forEach((entry) => {
        const week = getWeekNumber(entry.date);

        if (!grouped[week]) {
            grouped[week] = [];
        }

        grouped[week].push(entry);
    });

    return grouped;
}

export default YearOverViewPage;