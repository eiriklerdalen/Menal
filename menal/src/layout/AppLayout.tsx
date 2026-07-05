import { Route, Routes } from "react-router-dom";

import DashboardPage from "../pages/dashboard/DashboardPage";
import OverviewPage from "../pages/overview/OverviewPage";
import YearOverviewPage from "../pages/overview/YearOverviewPage";
import CalendarPage from "../pages/calendars/CalendarsPage";
import LogPage from "../pages/log/LogPage";
import NewCalendarPage from "../pages/calendars/new_calendar/NewCalendarPage"
import EditCalendarPage from "../pages/calendars/edit_calendar/EditCalendarPage";

import Sidebar from "./Sidebar";

type AppLayoutProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
};

function AppLayout({darkMode, setDarkMode}: AppLayoutProps) {
    return (
        <div className={`app-layout ${darkMode ? "dark-mode" : ""}`}>
            <Sidebar
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
            />

            <main className={`main-content ${darkMode ? "dark-mode" : ""}`}>
                <Routes>
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

export default AppLayout;