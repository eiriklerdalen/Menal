import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CalendarHeatMap from "../components/CalendarHeatMap";

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

    function createCalendar() {
        fetch("http://10.0.0.74:3000/profiles/1/calendars", {
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
            .then((data) => console.log("Created: ", data))
            .catch((err) => console.log(err));

        navigate("/calendars");
    }

    const colors = presets[maxRating];


    return (
        <>
            <h1>Ny kalender</h1>

            <div className="calendar-name-input">
                <p>Navn:</p>
                <input
                    value={calendarName}
                    onChange={(e) => setCalendarName(e.target.value)}
                />
            </div>

            <div className="calendar-rating-input">
                <p>Vurderingsskala:</p>

                {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                                <button 
                                    key={rating}
                                    className="new-rating"
                                    onClick={() => setMaxRating(rating)}
                                >
                                    {rating}
                                </button>
                            ))}            
            </div>

            <div className="scales-color-selector">
                <p>Farger:</p>
                {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                    <button
                        key={rating}
                        style={{ backgroundColor: colors[rating - 1] }}
                    >
                        {rating}
                    </button>
                ))}
            </div>

            <div className="create-new-calendar">
                <button
                    onClick={() => createCalendar()}
                >
                    Opprett
                </button>
            </div>

            <div className="calendar-preview">
                <CalendarHeatMap
                    entries={ generatePreviewEntries(maxRating, 120) }
                    name="preview"
                    variant="preview"
                />
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
        const randomRating = Math.floor(Math.random() * maxRating) + 1;

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