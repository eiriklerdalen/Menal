function App() {
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
        <CalendarHeatMap />
      </main>
    </div>
    </>
  )
}

const week_1 = [
    { date: "2026-06-01", rating: 1, trained: true },
    { date: "2026-06-02", rating: 2, trained: false },
    { date: "2026-06-03", rating: 3, trained: true },
    { date: "2026-06-04", rating: 4, trained: true },
    { date: "2026-06-05", rating: 5, trained: true },
    { date: "2026-06-06", rating: 6, trained: true },
    { date: "2026-06-07", rating: 6, trained: true },
  ];

const week_2 = [
    { date: "08-06-2026", rating: 0, trained: true},
    { date: "09-06-2026", rating: 0, trained: true},
    { date: "10-06-2026", rating: 0, trained: true},
    { date: "11-06-2026", rating: 0, trained: true},
    { date: "12-06-2026", rating: 0, trained: true},
    { date: "13-06-2026", rating: 0, trained: true},
    { date: "14-06-2026", rating: 0, trained: true},
]

const weeks = [
  week_1,
  week_2
]

function CalendarHeatMap() {
  return (
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
  );
}

export default App