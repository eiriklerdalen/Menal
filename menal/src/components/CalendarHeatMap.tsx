import { useState } from "react";
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

function CalendarHeatMap(
    { entries, name, variant, colors, numDays, oldestEntryDate }:
    {entries: Entry[], name: string, variant?: string, colors: string[], numDays: number, oldestEntryDate: string | null}
  ) {
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState<"lastYear" | number>("lastYear");
  let startDate: Date;
  let endDate: Date;

  if (selectedYear === "lastYear") {
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - numDays + 1);
  } else {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
  }

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

  const [hasSelectedYear, setHasSelectedYear] = useState(false);
  const years = getYearButtons(oldestEntryDate).toReversed();
  const useYearSelect = years.length > 2;

  return (
    <div className={`calendar ${variant}`}>
      <p className={`calendarName ${variant}`}>{name}</p>

      <div className="heatmap-layout">
        <div className={`year-buttons ${variant}`}>
          <button 
            className={selectedYear === "lastYear" ? "active" : ""}
            onClick={() => {
              setSelectedYear("lastYear")
              setHasSelectedYear(false);
            }}
          >
            Last year
          </button>

          {useYearSelect ? (
            <select
              className={`year-select ${hasSelectedYear ? "selected" : ""}`}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value))
                setHasSelectedYear(true);
              }}
            >
              {years.map((year) => (
                  <option key={year} value={year}>
                      {year}
                  </option>
              ))}
            </select>
          ) : (
            years.map((year) => (
              <button
                key={year}
                className={selectedYear === year ? "active" : ""}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))
          )}

          {/* {getYearButtons(oldestEntryDate).toReversed().map((year) => (
            <button
              key={year}
              className={selectedYear === year ? "active" : ""}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))} */}
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

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    const formattedDate = formatDateLocal(current);
    
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

function getYearButtons(oldestEntryDate: string | null) {
  if (oldestEntryDate === null) {
    return [new Date().getFullYear()];
  }

  const oldestYear = new Date(oldestEntryDate).getFullYear();
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let year = oldestYear; year <= currentYear; year++) {
    years.push(year);
  }

  return years;
}

export default CalendarHeatMap;