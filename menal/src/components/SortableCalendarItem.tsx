import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CalendarHeatMap from "./CalendarHeatMap";

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

type Props = {
    calendar: Calendar;
    calendarEntries: Entry[];
    colors: string[];
    onDelete: (calendarId: number, calendarName: string) => void;
    onEdit: (calendarId: number) => void;
}

function SortableCalendarItem({
    calendar,
    calendarEntries,
    colors,
    onDelete,
    onEdit,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: calendar.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="heatmap-instance"
        >

            <div
                className="drag-handles"
                {...attributes}
                {...listeners}
            >
                ⋮⋮
            </div>
            <CalendarHeatMap
                entries={calendarEntries}
                name={calendar.name}
                variant="default"
                colors={colors}
                numDays={364}
            />

            <div className="delete-button-container">
                <button
                    className="delete-button"
                    onClick={() => onDelete(calendar.id, calendar.name)}
                >
                    ✕
                </button>
            </div>

            <div className="edit-button-container">
                <button
                    className="edit-button"
                    onClick={() => {
                        onEdit(calendar.id)
                    }}
                >
                    ✎
                </button>
            </div>
        </div>
    )
}

export default SortableCalendarItem;