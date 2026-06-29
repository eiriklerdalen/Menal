import DashboardPage from "./pages/dashboard/DashboardPage";
import OverviewPage from "./pages/overview/OverviewPage";
import YearOverviewPage from "./pages/overview/YearOverviewPage";
import CalendarPage from "./pages/CalendarsPage";
import LogPage from "./pages/LogPage";
import NewCalendarPage from "./pages/NewCalendarPage"
import EditCalendarPage from "./pages/EditCalendarPage";
import { Routes, Route, useNavigate } from "react-router-dom";

import getDate from "./utils/date";

function App() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1
          className="menal-title"
          onClick={() => navigate("/dashboard")}
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
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
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