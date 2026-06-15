import { useEffect, useState } from "react";

type Entry = {
  id: number;
  profile_id: number;
  date: string;
  rating: number;
};

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("http://10.0.0.74:3000/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
    <div className='app-layout'>
      <aside className='sidebar'>
        <h1>Menal</h1>

        <nav>
          <button>Logg</button>
          <button>Kalendre</button>
          <button>Innstillinger</button>
        </nav>
      </aside>

      <main className="main-content">
        <h1>Something</h1>
        <CalendarHeatMap entries={entries}/>
      </main>
    </div>
    </>
  )
}

function getRatingForDate(date: string, entries: Entry[]) {
  const entry = entries.find((entry) => entry.date === date);
  if (entry) {
    return entry.rating
  }
  return 0
}

function getLastYear(entries: Entry[]) {
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

  for (let i = 364; i >= 1; i--) {
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

//const weeks = getLastYear()

function CalendarHeatMap({ entries }: {entries: Entry[]}) {
  const weeks = getLastYear(entries)
  return (
    <div className="calendar">
      <p className="calendarName">How was your day?</p>

      <div className="heatmap">
        {weeks.map((week) => (
          <div className="week">
            {week.map((day) => (
              <div
                key={day.date}
                className={`day rating-${day.rating}`}
                title={`${day.date}: ${day.rating}/6`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App