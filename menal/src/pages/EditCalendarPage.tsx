import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { apiURL } from "../config/api";

import CalendarHeatMap from "../components/CalendarHeatMap";
import ScaleColorSelector from "../components/ScaleColorSelector";

import type { Entry } from "../types";

import "/src/pages/EditCalendarPage.css";

function EditCalendarPage() {
    const navigate = useNavigate();

    const { calendarId } = useParams();
    const calendarIdNumber = Number(calendarId);

    const [calendarName, setCalendarName] = useState("");

    const [maxRating, setMaxRating] = useState(7);
        useEffect(() => {
        fetch(apiURL(`/profiles/1/calendars/${calendarIdNumber}`))
            .then((res) => res.json())
            .then((calendar) => {
                setCalendarName(calendar.name);
                setMaxRating(calendar.max_rating);
            });
    }, [calendarIdNumber]);

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/profiles/1/entries`))
            .then((res) => res.json())
            .then((data) => {
                const calendarEntries = data.filter(
                    (entry: Entry) => entry.calendar_id === calendarIdNumber
                );
                setEntries(calendarEntries);
            })
            .catch((err) => console.log(err));
    }, [calendarIdNumber]);

    const [colors, setColors] = useState<string[]>([]);
    useEffect(() => {
        loadColors(calendarIdNumber)
            .then((color) => setColors(color))
            .catch((err) => console.log(err));
    }, [calendarIdNumber]);

    return (
        <div className="edit-calendar-page">
            <h1>Rediger Kalender:</h1>

            <div className="calendar-settings">
                <div className="calendar-name-input">
                    <p>Navn:</p>
                    <input
                        value={calendarName}
                        onChange={(e) => setCalendarName(e.target.value)}
                        placeholder="For eksempel: Trening"
                    />
                </div>
                <ScaleColorSelector
                    colors={ colors }
                    setColors={ setColors }
                    maxRating={ maxRating }
                />
            </div>
            <div className="heatmap-color-preview">
                <p>Forhåndsvisning:</p>
                <div className="preview-heatmap">
                    <CalendarHeatMap
                        entries={ entries }
                        name="preview"
                        variant="preview"
                        colors={ colors }
                        numDays={ 364 }
                    />
                </div>
            </div>
            <button 
                className="save-button"
                onClick={() => {
                    saveCalendar(calendarIdNumber, calendarName, colors)
                        .then(() => navigate("/calendars"))
                }}
            >
                Bekreft endring
            </button>
        </div>
    )
}

async function loadColors(calendarId: number) {
    return fetch(apiURL(`/profiles/1/calendars/${calendarId}/colors`))
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

async function saveCalendar(calendarId: number, calendarName: string, colors: string[]) {
    return fetch(apiURL(`/profiles/1/calendars/${calendarId}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: calendarName,
        }),
    })
        .then(() => 
            fetch(apiURL(`/profiles/1/calendars/${calendarId}/colors`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    colors,
                }),
            })
        )
}

export default EditCalendarPage;