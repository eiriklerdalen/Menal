import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { HexColorPicker } from "react-colorful";

import CalendarHeatMap from "../components/CalendarHeatMap";

import "/src/pages/EditCalendarPage.css";

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function EditCalendarPage() {
    const navigate = useNavigate();

    const { calendarId } = useParams();
    const calendarIdNumber = Number(calendarId);

    const [calendarName, setCalendarName] = useState("");
    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

    const [maxRating, setMaxRating] = useState(7);
        useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarIdNumber}`)
            .then((res) => res.json())
            .then((calendar) => {
                setCalendarName(calendar.name);
                setMaxRating(calendar.max_rating);
            });
    }, [calendarIdNumber]);

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/entries`)
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

                <div className="scales-color-selector">
                    <p>Farger:</p>
                    <div className="color-buttons">
                        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                            <button
                                key={rating}
                                style={{ backgroundColor: colors[rating - 1] }}
                                onClick={() => setSelectedColorIndex(rating - 1)}
                            >
                                {rating}
                            </button>
                        ))}
                    </div>
                    {selectedColorIndex !== null && (
                        <div className="color-picker-popup">
                            <HexColorPicker
                                color={colors[selectedColorIndex]}
                                onChange={(newColor) => {
                                    const updatedColors = [...colors];
                                    updatedColors[selectedColorIndex] = newColor;
                                    setColors(updatedColors);
                                }}
                            />

                            <button 
                                className="close-color-selector-button"
                                onClick={() => setSelectedColorIndex(null)}
                            >
                                Lukk
                            </button>
                        </div>
                    )}
                </div>

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
    return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

async function saveCalendar(calendarId: number, calendarName: string, colors: string[]) {
    return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: calendarName,
        }),
    })
        .then(() => 
            fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}/colors`, {
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