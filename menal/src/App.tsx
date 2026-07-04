import { useState } from "react";

import LoginPage from "./pages/login/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import OverviewPage from "./pages/overview/OverviewPage";
import YearOverviewPage from "./pages/overview/YearOverviewPage";
import CalendarPage from "./pages/calendars/CalendarsPage";
import LogPage from "./pages/log/LogPage";
import NewCalendarPage from "./pages/calendars/new_calendar/NewCalendarPage"
import EditCalendarPage from "./pages/calendars/edit_calendar/EditCalendarPage";
import { Routes, Route, useNavigate } from "react-router-dom";

import ThemeSwitch from "./components/ThemeSwitch";
import { getDate } from "./utils/date";

import "./theme.css";

function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app-layout ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${darkMode ? "dark-mode" : ""}`}>
        <h1
          className="menal-title"
          onClick={() => navigate("/")}
        >
          Menal
        </h1>

        <nav>
          <button onClick={() => navigate("/dashboard")}>Dashbord</button>
          <button onClick={() => navigate("/overview")}>Oversikt</button>
          <button onClick={() => navigate(`/log/${getDate()}`)}>Logg</button>
          <button onClick={() => navigate("/calendars")}>Kalendre</button>
          <button onClick={() => navigate("/settings")}>Innstillinger</button>
        </nav>

        <ThemeSwitch
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </aside>

      <main className={`main-content ${darkMode ? "dark-mode" : ""}`}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/overview/:year" element={<YearOverviewPage />} />
            <Route path="/log/:date" element={<LogPage />} />
            <Route path="/calendars" element={<CalendarPage />} />
            <Route path="/calendars/new" element={<NewCalendarPage />} />
            <Route path="calendars/:calendarId/edit" element={<EditCalendarPage />} />
            <Route path="/settings" element={<h1>Innstillinger</h1>} />
        </Routes>
      </main>
    </div>
  )
}

export default App