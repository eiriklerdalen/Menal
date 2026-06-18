import { useState, useEffect } from "react";

type Calendar = {
  id: number;
  profile_id: number;
  name: string;
};

function LogPage() {
    /* Date selector */
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    /* Journal updates */
     const [text, setText] = useState("");
     useEffect(() => {
        const timeout = setTimeout(async () => {
            await saveJournalEntry(1, selectedDate, text)
        }, 1500);
        return () => clearTimeout(timeout);
     }, [text]);

    async function loadJournalEntry(date: string) {
        const res = await fetch(`http://10.0.0.74:3000/journal_entries/${date}`);

        const entry = await res.json();

        if (entry) {
            setText(entry.journal_text);
        } else {
            setText("");
        }
    }

    useEffect(() => {
        loadJournalEntry(selectedDate);
    }, [selectedDate]);

    /* Calendar updates*/
    const [calendars, setCalendars] = useState<Calendar[]>([]);
      useEffect(() => {
        fetch("http://10.0.0.74:3000/calendars")
          .then((res) => res.json())
          .then((data) => setCalendars(data))
          .catch((err) => console.log(err));
      }, []);

    return (
        <div>
            <h1>Logg dagen</h1>
            <input
                className="date-selector"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />

            <div className="log-entry">
                <label>
                    Skriv om dagen:
                    <textarea
                        className="journal-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </label>

                <div className="calendar-buttons">
                    {calendars.map((calendar) => (
                        <div key={calendar.id}>
                            <p>{calendar.name}</p>

                            {[1, 2, 3, 4, 5, 6].map((rating) => (
                                <button 
                                key={rating}
                                onClick={() => saveEntry(calendar.id, rating)}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

async function saveJournalEntry(profileID: number, date: string, text: string) {
    await fetch("http://10.0.0.74:3000/journal_entries", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile_id: profileID,
            date: date,
            journal_text: text
        })
    })
        .then((res) => res.json())
        .then((data) => console.log("Saved:", data))
        .catch((err) => console.log(err))
}

function saveEntry(calendarId: number, rating: number) {
    const today = new Date().toISOString().split("T")[0]; /* Endre til valgte dato! */

    fetch("http://10.0.0.74:3000/entries", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            calendar_id: calendarId,
            date: today,
            rating: rating,
        }),
    })
        .then((res) => res.json())
        .then((data) => console.log("Saved:", data))
        .catch((err) => console.error(err));
}

export default LogPage;