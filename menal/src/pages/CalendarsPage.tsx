import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SortableCalendarItem from "../components/SortableCalendarItem";

import "/src/pages/CalendarsPage.css";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

type Calendar = {
  id: number;
  profile_id: number;
  name: string;
  max_rating: number;
  position: number;
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
    fetch("http://10.0.0.76:3000/profiles/1/calendars")
      .then((res) => res.json())
      .then((data) => setCalendars(data))
      .catch((err) => console.log(err));
  }, []);

  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    fetch("http://10.0.0.76:3000/profiles/1/entries")
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

  function deleteCalendar(calendarId: number, calendarName: string) {
    const shouldDelete = confirm(`
      Er du sikker på at du vil slette ${calendarName}?
    `);

    if (!shouldDelete) {
      return;
    }

    fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setCalendars((prev) => prev.filter((calendar) => calendar.id !== calendarId));
      })
      .catch((err) => console.log(err));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setCalendars((prevCalendars) => {
      const oldIndex = prevCalendars.findIndex(
        (calendar) => calendar.id === active.id
      );

      const newIndex = prevCalendars.findIndex(
        (calendar) => calendar.id === over.id
      );

      return arrayMove(prevCalendars, oldIndex, newIndex);
    });
  }
  

  return (
  <>
      <h1>Kalendre</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={calendars.map((calendar) => calendar.id)}>
          {calendars.map((calendar) => {
            const calendarEntries = entries.filter(
              (entry) => entry.calendar_id === calendar.id
            );

            return (
              <SortableCalendarItem
                key={ calendar.id }
                calendar={ calendar }
                calendarEntries={ calendarEntries }
                colors={ calendarColors[calendar.id] ?? [] }
                onDelete={ deleteCalendar }
                onEdit={(id) => navigate(`/calendars/${id}/edit`)}
              />
            )
          })}
        </SortableContext>
      </DndContext>
      <div className="add-calendar-container">
        <button onClick={() => navigate("/calendars/new")}>
          Add Calendar
        </button>
      </div>
  </>
  );
}

async function loadColors(calendarId: number) {
    return fetch(`http://10.0.0.76:3000/profiles/1/calendars/${calendarId}/colors`)
        .then((res) => res.json())
        .then((data) => data.map((row: { rating: number; color: string }) => row.color));
}

export default CalendarsPage;