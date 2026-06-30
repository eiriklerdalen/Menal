import { useEffect, useState } from "react";
import type { JournalEntry } from "../../types";

import calculateJournalStreak from "../../utils/streak";

function StatisticsPanel() {

    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    useEffect(() => {
        fetch("http://10.0.0.76:3000/profiles/1/journal_entries")
            .then((res) => res.json())
            .then((data) => setJournalEntries(data))
            .catch((err) => console.log(err));
    }, []);

    const todaysStreak = calculateJournalStreak(journalEntries.map((je) => je.date), new Date());

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaysStreak = calculateJournalStreak(journalEntries.map((je) => je.date), yesterday);

    const hasWrittenJornalToday = todaysStreak !== 0;

    const numJournalEntries = journalEntries.length;

    return (
        <div className="statistics-section">
            <h4>Statistikk...</h4>
            <div className="statistics-content">
                <div className="statistic">
                    <p>{hasWrittenJornalToday ? `Nåværende streak:` : `Fortsett streak:`}</p>
                    <div className="stat-content">{hasWrittenJornalToday ? todaysStreak : yesterdaysStreak}</div>
                </div>
                <div className="statistic">
                    <p>Antall journaler:</p>
                    <div className="stat-content">{numJournalEntries}</div>
                </div>
            </div>
        </div>
    )
}

export default StatisticsPanel;

// ───────────────────────────────
// Current streak: 17 days

// Journal entries: 184

// Calendars: 5

// ───────────────────────────────