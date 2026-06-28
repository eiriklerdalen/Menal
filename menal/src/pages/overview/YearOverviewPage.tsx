import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "/src/pages/overview/YearOverViewPage.css";

type Calendar = {
  id: number;
  profile_id: number;
  name: string;
  max_rating: number;
  position: number;
  oldestEntryDate: string;
};

type JournalEntry = {
    id: number;
    profile_id: number;
    date: string;
    journal_text: string;
};

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function YearOverViewPage() {
    const { year } = useParams();

    const [calendars, setCalendars] = useState<Calendar[]>([]);
    useEffect(() => {
    fetch("http://10.0.0.76:3000/profiles/1/calendars")
        .then((res) => res.json())
        .then((data) => setCalendars(data))
        .catch((err) => console.log(err));
    }, []);

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

    const [calendarColors, setCalendarColors] = useState<Record<number, string[]>>({});
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

    const groupedJournalEntries = groupEntriesByWeek(journalEntries);
    const journalWeeks = Object.keys(groupedJournalEntries).map(Number).sort((a, b) => a - b);

    const groupedEntries = groupEntriesByWeek(entries);
    console.log("This:", groupedEntries);

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
                                    <h4>{journalEntry.date}</h4>
                                    <p>{journalEntry.journal_text}</p>

                                    {groupedEntries[week]
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
                                            // <p key={entry.id}>
                                            //     {entry.calendar_id}: {entry.rating}
                                            // </p>
                                        ))}
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

async function loadColors(calendarId: number) {
    return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default YearOverViewPage;