import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useRequiredUser from "../../hooks/useRequiredUser";

import { apiURL } from "../../config/api";

import useEntries from "../../hooks/useEntries";
import useCalendars from "../../hooks/useCalendars";

import { getDate, getDateWriting } from "../../utils/date";
import type { Entry } from "../../types";

import "/src/pages/log/LogPage.css";

function LogPage() {
    const user = useRequiredUser();
    const profileId = user.profileId;

    const navigate = useNavigate();

    /* Date selector */
    const { date } = useParams();

    const [selectedDate, setSelectedDate] = useState(date!);

    /* Journal updates */
    const [text, setText] = useState("");
    const [userHasEdited, setUserHasEdited] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadJournalEntry() {
            const res = await fetch(
                apiURL(`/profiles/${profileId}/journal_entries/${selectedDate}`),
                { signal: controller.signal }
            );

            if (!res.ok) {
                setUserHasEdited(false);
                setText("");
                return;
            }

            const entry = await res.json();

            setUserHasEdited(false);
            setText(entry?.journal_text ?? "");
        }

        loadJournalEntry().catch((err) => {
            if (err.name !== "AbortError") {
                console.error(err);
            }
        });

        return () => controller.abort();
    }, [selectedDate]);

    useEffect(() => {
        if (!userHasEdited) return;

        const timeout = setTimeout(() => {
            if (userHasEdited && text.trim() === "") {
                deleteJournalEntry(profileId, selectedDate);
            } else {
                saveJournalEntry(profileId, selectedDate, text);
            }
        }, 2500);

        return () => clearTimeout(timeout);
    }, [text, selectedDate, userHasEdited]);

    /* Calendar updates*/
    const { calendars, calendarColors } = useCalendars();
    const { entries, setEntries } = useEntries(selectedDate);

    function getRatingsForCalendar(calendarId: number) {
        const entry = entries.find((e) =>
            e.calendar_id === calendarId && e.date === selectedDate
        );

        return entry?.rating ?? 0;
    }

    function loadEntries(date: string) {
        fetch(apiURL(`/profiles/${profileId}/entries/${date}`))
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

    async function deleteEntry(profileId: number, calendarId: number, date: string) {
        await fetch(apiURL(`/profiles/${profileId}/entries/${calendarId}/${date}`), {
            method: "DELETE"
        })
    }

    async function deleteJournalEntry(profileId: number, date: string) {
        await fetch(apiURL(`/profiles/${profileId}/journal_entries/${date}`), {
            method: "DELETE"
        });
    }

    function changeDate(numDays: number) {
        const date = new Date(selectedDate);

        date.setDate(date.getDate() + numDays);
        const newDate = getDate(date);

        setSelectedDate(newDate);
        navigate(`/log/${newDate}`);
    }

    return (
        <div className="log-page">
            <h1>Logg dagen / {getDateWriting(new Date(selectedDate), true)}</h1>
            <div className="date-selector-container">
                <button 
                    className="date-arrow"
                    onClick={() => changeDate(-1)}
                >
                    ←
                </button>

                <input
                    className="date-selector"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        navigate(`/log/${e.target.value}`);
                    }}
                />

                <button
                    className="date-arrow"
                    onClick={() => changeDate(1)}
                >
                    →
                </button>
            </div>

            <div className="log-entry">
                <label>
                    Skriv om dagen:
                    <textarea
                        className="journal-input"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setUserHasEdited(true);
                        }}
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
                                        deleteEntry(profileId, calendar.id, selectedDate);
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
                                            saveEntry(profileId, calendar.id, rating, selectedDate);
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
    await fetch(apiURL(`/profiles/${profileID}/journal_entries`), {
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

async function saveEntry(profileId: number, calendarId: number, rating: number, date: string) {
    return await fetch(apiURL(`/profiles/${profileId}/entries`), {
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