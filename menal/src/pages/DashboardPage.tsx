import { useEffect, useState } from "react";

import useCalendars from "../hooks/useCalendars";
import useEntries from "../hooks/useEntries";
import getDate from "../utils/date";

const profileId = 1;

function DashboardPage() {
    const date = getDate();

    // const { calendars, calendarColors } = useCalendars();
    // const { entries, setEntries } = useEntries(date);

    const [name, setName] = useState<string>("");
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/${profileId}`)
            .then((res) => res.json())
            .then((data) => setName(data.name))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="dashboard">
            <h1>Velkommen tilbake, {name}</h1>

            <div className="today-section">
                <h4>I dag...</h4>

            </div>
        </div>
    )
}

export default DashboardPage;