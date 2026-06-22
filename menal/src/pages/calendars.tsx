import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarHeatMap from "../components/CalendarHeatMap";

type Calendar = {
  id: number;
  profile_id: number;
  name: string;
  max_rating: number;
};

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function CalendarsPage() {
  const navigate = useNavigate();

  const [calendars, setCalendars] = useState<Calendar[]>([]);
  useEffect(() => {
    fetch("http://10.0.0.74:3000/profiles/1/calendars")
      .then((res) => res.json())
      .then((data) => setCalendars(data))
      .catch((err) => console.log(err));
  }, []);

  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    fetch("http://10.0.0.74:3000/profiles/1/entries")
        .then((res) => res.json())
        .then((data) => setEntries(data))
        .catch((err) => console.error(err));
  }, []);

  const [calendarColors, setCalendarColors] = useState<Record<number, string[]>>({});
    useEffect(() => {
      calendars.forEach((calendar) => {
          loadColors(calendar.id).then((colors) => {
              setCalendarColors((prev) => ({
                  ...prev,
                  [calendar.id]: colors,
              }));
          });
      });
  }, [calendars]);

  return (
  <>
      <h1>Kalendre</h1>
      {calendars.map((calendar) => {
        const calendarEntries = entries.filter(
          (entry) => entry.calendar_id === calendar.id
        );

        return (
          <>
            <div key={calendar.id}>
              <CalendarHeatMap
                entries={ calendarEntries }
                name={ calendar.name }
                variant="default"
                colors={ calendarColors[calendar.id] ?? [] }
              />
            </div>
          </>
        )
      })}
      <div className="add-calendar-container">
        <button onClick={() => navigate("/calendars/new")}>
          Add Calendar
        </button>
      </div>
  </>
  );
}

function loadColors(calendarId: number) {
    return fetch(`http://10.0.0.74:3000/profiles/1/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default CalendarsPage;