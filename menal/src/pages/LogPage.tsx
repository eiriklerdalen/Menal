import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "/src/pages/LogPage.css";

import type { Calendar, Entry } from "../types";

function LogPage() {
    const navigate = useNavigate();

    /* Date selector */
    const { date } = useParams();

    const [selectedDate, setSelectedDate] = useState("");
    useEffect(() => {
        setSelectedDate(
            date ?? new Date().toISOString().split("T")[0]
        );
    }, [date]);

    function changeDate(newDate: string) {
        setSelectedDate(newDate);
        navigate(`/log/${newDate}`);
    }

    /* Journal updates */
     const [text, setText] = useState("");
     useEffect(() => {
        const timeout = setTimeout(async () => {
            await saveJournalEntry(1, selectedDate, text)
        }, 1500);
        return () => clearTimeout(timeout);
     }, [text]);

    async function loadJournalEntry(date: string) {
        const res = await fetch(`http://10.0.0.76:3000/profiles/1/journal_entries/${date}`);

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
        fetch("http://10.0.0.76:3000/profiles/1/calendars")
            .then((res) => res.json())
            .then((data) => setCalendars(data))
            .catch((err) => console.log(err));
    }, []);

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/entries/${selectedDate}`)
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [selectedDate]);

    function getRatingsForCalendar(calendarID: number) {
        const entry = entries.find((e) =>
            e.calendar_id === calendarID
        );

        if (entry) {
            return entry.rating
        } else {
            return 0
        }
    }

    function loadEntries(date: string) {
        fetch(`http://10.0.0.76:3000/profiles/1/entries/${date}`)
        .then((res) => res.json())
        .then((data) => {
            const entriesWithDefaults = calendars.map((calendar) => {
                const existingEntry = data.find(
                    (entry: Entry) => entry.calendar_id === calendar.id
                );

                return existingEntry ?? {
                    id: 0,
                    calendar_id: calendar.id,
                    date,
                    rating: 0,
                };
            });

            setEntries(entriesWithDefaults);
        })
        .catch((err) => console.log(err));
    }
    useEffect(() => {
        if (calendars.length > 0) {
            loadEntries(selectedDate);
        }
    }, [selectedDate]);

    const [calendarColors, setCalendarColors] = useState<
        Record<number, string[]>
    >({});
        useEffect(() => {
        calendars.forEach((calendar) => {
            fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendar.id}/colors`)
                .then((res) => res.json())
                .then((data) => {
                    setCalendarColors((prev) => ({
                        ...prev,
                        [calendar.id]: data.map(
                            (row: { color: string }) => row.color
                        ),
                    }));
                });
        });
    }, [calendars]);
    
    function updateEntry(calendarId: number, rating: number, date: string) {
        setEntries((prevEntries) => {
            const exists = prevEntries.some(
                (entry) => entry.calendar_id === calendarId
            );

            if (exists) {
                return prevEntries.map((entry) =>
                    entry.calendar_id === calendarId
                        ? { ...entry, rating }
                        : entry
                );
            }

            return [
                ...prevEntries,
                {
                    id: 0,
                    calendar_id: calendarId,
                    date,
                    rating,
                },
            ];
        });
    }

    async function deleteEntry(calendarId: number, date: string) {
        await fetch(`http://10.0.0.76:3000/profiles/1/entries/${calendarId}/${date}`, {
            method: "DELETE"
        })
    }

    return (
        <div className="log-page">
            <h1>Logg dagen</h1>
            <div className="data-selector-container">
                <input
                    className="date-selector"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        navigate(`/log/${e.target.value}`);
                    }}
                />
            </div>

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
                    {calendars.map((calendar) => {
                        const currentRating = getRatingsForCalendar(calendar.id);
                        
                        return (
                            <div 
                                className="rating-container"
                                key={calendar.id}
                            >
                            <div className="rating-header">
                                <p>{calendar.name}</p>
                                <div 
                                    className="selected-rating"
                                    style={{
                                        backgroundColor:   
                                            currentRating === 0
                                                ? "gray"
                                                : calendarColors[calendar.id]?.[currentRating - 1] ?? "lightgray"
                                    }}
                                />
                            </div>

                            <div className="rating-button-row">
                                <button
                                    className="reset-button rating-button" 
                                    onClick={() => {
                                        updateEntry(calendar.id, 0, selectedDate);
                                        deleteEntry(calendar.id, selectedDate);
                                    }}
                                >
                                    0
                                </button>

                                {Array.from({ length: calendar.max_rating}, (_, i) => i + 1).map((rating) => (
                                    <button 
                                        className="rating-button"
                                        key={rating}
                                        style={{
                                            backgroundColor:
                                                calendarColors[calendar.id]?.[rating-1] ?? "lightgray"
                                        }}
                                        onClick={() => {
                                            updateEntry(calendar.id, rating, selectedDate);
                                            saveEntry(calendar.id, rating, selectedDate);
                                        }}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

async function saveJournalEntry(profileID: number, date: string, text: string) {
    await fetch("http://10.0.0.76:3000/profiles/1/journal_entries", {
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

async function saveEntry(calendarId: number, rating: number, date: string) {
    return await fetch("http://10.0.0.76:3000/profiles/1/entries", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            calendar_id: calendarId,
            date: date,
            rating: rating,
        }),
    })
        .then((res) => res.json())
        .then((data) => console.log("Saved:", data))
        .catch((err) => console.error(err));
}

export default LogPage;