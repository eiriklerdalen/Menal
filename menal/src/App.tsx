import CalendarPage from "./pages/calendars";
import LogPage from "./pages/log";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1>Menal</h1>

        <nav>
          <button onClick={() => navigate("/log")}>Logg</button>
          <button onClick={() => navigate("/calendars")}>Kalendre</button>
          <button onClick={() => navigate("/settings")}>Innstillinger</button>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<h1>Velkommen tilbake!</h1>} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/log/:date" element={<LogPage />} />
            <Route path="/calendars" element={<CalendarPage />} />
            <Route path="/settings" element={<h1>Innstillinger</h1>} />
        </Routes>
      </main>
    </div>
  )
}

export default App