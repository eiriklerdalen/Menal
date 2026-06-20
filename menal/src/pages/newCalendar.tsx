import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NewCalendarPage() {
    const navigate = useNavigate();

    const [calendarName, setCalendarName] = useState("");
    const [maxRating, setMaxRating] = useState(6);

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

                {[1, 2, 3, 4, 5, 6].map((rating) => (
                                <button 
                                    key={rating}
                                    className="new-rating"
                                    onClick={() => setMaxRating(rating)}
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
        </>
    );
}

export default NewCalendarPage