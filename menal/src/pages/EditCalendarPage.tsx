import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CalendarHeatMap from "../components/CalendarHeatMap";

import "/src/pages/EditCalendarPage.css";

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function EditCalendarPage() {
    const { calendarId } = useParams();
    const calendarIdNumber = Number(calendarId);

    const [calendarName, setCalendarName] = useState("");
    const [maxRating, setMaxRating] = useState(7);

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
    })

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
                <div className="scales-color-selector">
                    <p>Farger:</p>
                    <div className="color-buttons">
                        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                            <button
                                key={rating}
                                style={{ backgroundColor: colors[rating - 1] }}
                            >
                                {rating}
                            </button>
                        ))}
                    </div>
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
        </div>
    )
}

function loadColors(calendarId: number) {
    return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default EditCalendarPage;