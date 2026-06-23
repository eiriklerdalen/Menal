import { useNavigate } from "react-router-dom";

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

function getRatingForDate(date: string, entries: Entry[]) {
  const entry = entries.find((entry) => entry.date === date);
  if (entry) {
    return entry.rating
  }
  return 0
}

function getLastYear(entries: Entry[], numDays: number) {
  const today = new Date();
  const daysIntoWeek = today.getDay()

  // Opprinnelig egen funskjon
  const currWeek = [];

  for (let i = 0; i <= daysIntoWeek; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() - daysIntoWeek + i)

    const formattedDate = date.toISOString().split('T')[0];

    currWeek.push({
      date: formattedDate,
      rating: getRatingForDate(formattedDate, entries)
    });
  }

  // Opprinnelig egen funksjon
  const days = [];

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysIntoWeek); 

  for (let i = numDays; i >= 1; i--) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() - i)

    const formattedDate = date.toISOString().split('T')[0];

    days.push({
      date: formattedDate,
      rating: getRatingForDate(formattedDate, entries)
    });
  }

  const weeks: { date: string; rating: number; }[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return [
    ...weeks,
    currWeek
  ]
}

function CalendarHeatMap({ entries, name, variant, colors, numDays }: {entries: Entry[], name: string, variant?: string, colors: string[], numDays: number}) {
  const navigate = useNavigate();

  const weeks = getLastYear(entries, numDays)
  return (
    <div className={`calendar ${variant}`}>
      <p className={`calendarName ${variant}`}>{name}</p>

      <div className={`heatmap ${variant}`}>
        {weeks.map((week) => (
          <div className="week">
            {week.map((day) => (
              <div
                key={day.date}
                className={`day rating-${day.rating} ${variant}`}
                style = {{
                  backgroundColor:
                    day.rating === 0
                      ? "gray"
                      : colors[day.rating - 1]
                }}
                title={`${day.date}: ${day.rating}/6`}
                onClick={() => navigate(`/log/${day.date}`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarHeatMap;