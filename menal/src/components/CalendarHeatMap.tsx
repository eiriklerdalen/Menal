import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

type Day = {
  date: string,
  rating: number
}

function getRatingForDate(date: string, entries: Entry[]) {
  const entry = entries.find((entry) => entry.date === date);
  if (entry) {
    return entry.rating
  }
  return 0
}

function getYear(entries: Entry[], numDays: number, startDate: Date, endDate: Date) {
  const weeks: { date: string; rating: number }[][] = [];

  const current = new Date(startDate);
  const end = new Date(endDate);

  let currentWeek: { date: string; rating: number }[] = [];

  while (current <= end) {
    const formattedDate = current.toISOString().split("T")[0];
    
    currentWeek.push({
      date: formattedDate,
      rating: getRatingForDate(formattedDate, entries),
    });

    const isEndOfWeek = current.getDay() === 6;

    if (isEndOfWeek) {
      if (weeks.length === 0) {
        while (currentWeek.length < 7) {
          currentWeek.unshift({
            date: "",
            rating: -1,
          });
        }
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks
}

function CalendarHeatMap({ entries, name, variant, colors, numDays }: {entries: Entry[], name: string, variant?: string, colors: string[], numDays: number}) {
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState<"lastYear" | "2026">("lastYear");
  let startDate: Date;
  let endDate: Date;

  if (selectedYear === "lastYear") {
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - numDays + 1);
  } else {
      startDate = new Date("2026-01-01");
      endDate = new Date("2026-12-31");
  }

  //const weeks = getLastYear(entries, numDays)
  const weeks = getYear(entries, numDays, startDate, endDate);

  function getMonthLabel(week: Day[]) {
    const firstDayOfMonth = week.find((day) => {
      return new Date(day.date).getDate() === 1
    })

    if (!firstDayOfMonth) {
      return ""
    }

    return new Date(firstDayOfMonth.date).toLocaleString("en-US", {
      month: "short",
    })
  }

  return (
    <div className={`calendar ${variant}`}>
      <p className={`calendarName ${variant}`}>{name}</p>

      <div className="heatmap-layout">
        <div className="year-buttons">
          <button 
            className={selectedYear === "lastYear" ? "active" : ""}
            onClick={() => setSelectedYear("lastYear")}
          >
            Last year
          </button>
          <button 
            className={selectedYear === "2026" ? "active" : ""}
            onClick={() => setSelectedYear("2026")}
          >
            2026
          </button>
        </div>

        <div className="heatmap-content">
          <div className="month-row">
            {weeks.map((week) => (
              <div className="month-label">
                {getMonthLabel(week)}
              </div>
            ))}
          </div>

          <div className={`heatmap ${variant}`}>
            {weeks.map((week, weekIndex) => (
              <div className="week" key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={
                      day.rating === -1
                        ? `day placeholder ${variant}`
                        : `day rating-${day.rating} ${variant}`
                    }
                    style = {{
                      backgroundColor:
                        day.rating === 0
                          ? "gray"
                          : colors[day.rating - 1]
                    }}
                    title={day.rating === -1 ? "" : `${day.date}: ${day.rating}/6`}
                    onClick={() => {
                      if (day.rating != -1) {
                        navigate(`/log/${day.date}`)
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeatMap;