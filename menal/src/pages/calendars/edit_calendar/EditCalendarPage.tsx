import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { apiURL } from "../../../config/api";

import useRequiredUser from "../../../hooks/useRequiredUser";

import CalendarHeatMap from "../../../components/CalendarHeatMap";
import ScaleColorSelector from "../../../components/ScaleColorSelector";

import type { Entry } from "../../../types";

import "/src/pages/calendars/edit_calendar/EditCalendarPage.css";

function EditCalendarPage() {
    const user = useRequiredUser();
    const userId = user.userId;

    const navigate = useNavigate();

    const { calendarId } = useParams();
    const calendarIdNumber = Number(calendarId);

    const [calendarName, setCalendarName] = useState("");

    const [maxRating, setMaxRating] = useState(7);
        useEffect(() => {
        fetch(apiURL(`/users/${userId}/calendars/${calendarIdNumber}`))
            .then((res) => res.json())
            .then((calendar) => {
                setCalendarName(calendar.name);
                setMaxRating(calendar.max_rating);
            });
    }, [calendarIdNumber]);

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/users/${userId}/entries`))
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
        loadColors(userId, calendarIdNumber)
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
                        oldestEntryDate={null}
                    />
                </div>
            </div>
            <button 
                className="save-edit-button"
                onClick={() => {
                    saveCalendar(userId, calendarIdNumber, calendarName, colors)
                        .then(() => navigate("/calendars"))
                }}
            >
                Bekreft endring
            </button>
        </div>
    )
}

async function loadColors(userId: number, calendarId: number) {
    return fetch(apiURL(`/users/${userId}/calendars/${calendarId}/colors`))
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

async function saveCalendar(userId: number, calendarId: number, calendarName: string, colors: string[]) {
    return fetch(apiURL(`/users/${userId}/calendars/${calendarId}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: calendarName,
        }),
    })
        .then(() => 
            fetch(apiURL(`/users/${userId}/calendars/${calendarId}/colors`), {
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