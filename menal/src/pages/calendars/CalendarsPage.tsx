import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiURL } from "../../config/api";

import useRequiredUser from "../../hooks/useRequiredUser";
import useCalendars from "../../hooks/useCalendars";

import SortableCalendarItem from "../../components/SortableCalendarItem";

import type { Entry } from "../../types";

import "/src/pages/calendars/CalendarsPage.css";
import "/src/components/CalendarHeatMap.css"

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

function CalendarsPage() {
  const user = useRequiredUser();
  const profileId = user.profileId;

  const navigate = useNavigate();

  const { calendars, setCalendars, calendarColors } = useCalendars();
  const numCalendars = calendars.length;
  const calendarLimitReached = numCalendars >= 5;

  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    fetch(apiURL(`/profiles/${profileId}/entries`))
        .then((res) => res.json())
        .then((data) => setEntries(data))
        .catch((err) => console.error(err));
  }, []);

  function deleteCalendar(calendarId: number, calendarName: string) {
    const shouldDelete = confirm(`
      Er du sikker på at du vil slette ${calendarName}?
    `);

    if (!shouldDelete) {
      return;
    }

    fetch(apiURL(`/profiles/${profileId}/calendars/${calendarId}`), {
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
    <div className="calendar-page">
      <div className="calendar-page-header">
        <h1>Kalendre</h1>
        <p>{calendars.length}/5</p>
      </div>

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
        <button 
          disabled={calendarLimitReached}
          onClick={() => navigate("/calendars/new")}
        >
          Add New Calendar
        </button>
        {calendarLimitReached && (
          <p className="calendar-limit-message">
              Du har nådd maks antall kalendere.
          </p>
        )}
      </div>
    </div>
  );
}

export default CalendarsPage;