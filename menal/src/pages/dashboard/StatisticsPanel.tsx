import { useEffect, useState } from "react";
import type { JournalEntry } from "../../types";

import { apiURL } from "../../config/api";
import calculateJournalStreak from "../../utils/streak";

type StatisticsPanelProps = {
    profileId: number;
};

function StatisticsPanel({profileId}: StatisticsPanelProps) {

    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/profiles/${profileId}/journal_entries`))
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
        <div className="card-section">
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