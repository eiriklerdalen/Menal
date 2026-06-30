function calculateJournalStreak(journalEntries: string[], startDate: Date = new Date()) {
    const dateSet = new Set(journalEntries);

    let streak = 0;
    const currentDate = new Date(startDate);

    while (dateSet.has(currentDate.toISOString().split("T")[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak
}

export default calculateJournalStreak;

