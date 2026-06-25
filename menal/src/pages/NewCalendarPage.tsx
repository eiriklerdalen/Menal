import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CalendarHeatMap from "../components/CalendarHeatMap";
import ScaleColorSelector from "../components/ScaleColorSelector";

import "/src/pages/NewCalendarPage.css";

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function NewCalendarPage() {
    const navigate = useNavigate();

    const [calendarName, setCalendarName] = useState("");
    const [maxRating, setMaxRating] = useState(7);
    const [colors, setColors] = useState<string[]>(presets[7]);

    function createCalendar() {
        if (calendarName.trim() === "") {
            alert("Kalenderen må ha et navn.");
            return;
        }

        fetch("http://10.0.0.76:3000/profiles/1/calendars", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: calendarName,
                max_rating: maxRating
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${data.id}/colors`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        colors: colors,
                    }),
                });
            })
            .then(() => navigate("/calendars"))
            .catch((err) => console.log(err));
    }

    // const colors = presets[maxRating];
    const [previewEntries, setPreviewEntries] = useState(
        generatePreviewEntries(maxRating, 365)
    );

    return (
        <>
            <div className="new-calendar-page">
                <h1>Ny kalender</h1>

                <div className="calendar-settings">
                    <div className="calendar-name-input">
                        <p>Navn:</p>
                        <input
                            value={calendarName}
                            onChange={(e) => setCalendarName(e.target.value)}
                            placeholder="For eksempel: Trening"
                        />
                    </div>

                    <div className="calendar-rating-input">
                        <p>
                            Vurderingsskala:
                            <span className="edit-warning">
                                {" "}
                                (kan ikke endres senere)
                            </span>
                        </p>

                        <div className="rating-buttons">
                            {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                                            <button 
                                                key={rating}
                                                className="new-rating"
                                                style={{
                                                    backgroundColor:
                                                        maxRating === rating ? "#2ECC71" : "white"
                                                }}
                                                onClick={() => {
                                                    setMaxRating(rating);
                                                    setColors(presets[rating])
                                                    setPreviewEntries(generatePreviewEntries(rating, 365));
                                                }}
                                            >
                                                {rating}
                                            </button>
                                        ))}        
                        </div>
                    </div>
                </div>

                <div className="color-settings">
                    <ScaleColorSelector
                        colors={ colors }
                        setColors={ setColors }
                        maxRating={ maxRating }
                    />

                    <div className="calendar-preview">
                        <p>Forhåndsvisning:</p>
                        <div className="preview-heatmap">
                            <CalendarHeatMap
                                entries={ previewEntries }
                                name="preview"
                                variant="preview"
                                colors={ colors }
                                numDays={182}
                            />
                        </div>
                    </div>
                </div>

                <div className="create-new-calendar-button">
                        <button
                            onClick={() => createCalendar()}
                        >
                            Opprett
                        </button>
                </div>
            </div>
        </>
    );
}

function generatePreviewEntries(maxRating: number, days: number): Entry[] {
    const entries: Entry[] = [];

    for (let i = 0; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dateString = date.toISOString().split("T")[0];
        const randomRating = Math.floor(Math.random() * (maxRating + 1));

        entries.push({
            id: i,
            calendar_id: 0,
            date: dateString,
            rating: randomRating,
        });
    }

    return entries
}

const preset_1 = [
    "#2ECC71",
];

const preset_2 = [
    "#FF4D4D",
    "#2ECC71",
];

const preset_3 = [
    "#FF4D4D",
    "#FFD93D",
    "#2ECC71",
];

const preset_4 = [
    "#FF4D4D",
    "#FFD93D",
    "#6EEB83",
    "#2ECC71",
];

const preset_5 = [
    "#FF4D4D",
    "#FF8A3D",
    "#FFD93D",
    "#6EEB83",
    "#2ECC71",
];

const preset_6 = [
    "#FF4D4D",
    "#FF8A3D",
    "#FFD93D",
    "#C7F464",
    "#6EEB83",
    "#2ECC71",
]
const preset_7 = [
    "#D7263D",
    "#FF4D4D",
    "#FF8A3D",
    "#FFD93D",
    "#C7F464",
    "#6EEB83",
    "#2ECC71", 
];

const presets: Record<number, string[]> = {
    1: preset_1,
    2: preset_2,
    3: preset_3,
    4: preset_4,
    5: preset_5,
    6: preset_6,
    7: preset_7,
}

export default NewCalendarPage