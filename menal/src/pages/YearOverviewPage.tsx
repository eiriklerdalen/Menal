import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

type JournalEntry = {
    id: number;
    profile_id: number;
    date: string;
    journal_text: string;
};

function YearOverViewPage() {
    const { year } = useParams();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/overview/${year}/journal_entries`)
            .then((res) => res.json())
            .then((data) => setEntries(data))
            .catch((err) => console.log(err));
    }, [year]);

    const groupedEntries = groupEntriesByWeek(entries);
    const weeks = Object.keys(groupedEntries).map(Number).sort((a, b) => a - b);

    const [openWeek, setOpenWeek] = useState<number | null>(null);

    return (
        <div className="year-overview-page">
            <h1>Oversikt/{year}</h1>
            {weeks.map((week) => (
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
                            {groupedEntries[week].map((entry) => (
                                <div key={entry.date} className="journal-entry">
                                    <h4>{entry.date}</h4>
                                    <p>{entry.journal_text}</p>
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

function groupEntriesByWeek(entries: JournalEntry[]) {
    const grouped: Record<number, JournalEntry[]> = {};

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