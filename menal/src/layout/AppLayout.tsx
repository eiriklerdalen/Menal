import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import DashboardPage from "../pages/dashboard/DashboardPage";
import OverviewPage from "../pages/overview/OverviewPage";
import YearOverviewPage from "../pages/overview/YearOverviewPage";
import CalendarPage from "../pages/calendars/CalendarsPage";
import LogPage from "../pages/log/LogPage";
import NewCalendarPage from "../pages/calendars/new_calendar/NewCalendarPage"
import EditCalendarPage from "../pages/calendars/edit_calendar/EditCalendarPage";
import SettingsPage from "../pages/settings/SettingsPage";

import Sidebar from "./Sidebar";

type AppLayoutProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
};

function AppLayout({darkMode, setDarkMode}: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`app-layout ${sidebarOpen ? "" : "sidebar-collapsed"} ${darkMode ? "dark-mode" : ""}`}>

            <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-expanded={sidebarOpen}
                aria-label={sidebarOpen ? "Lukk sidemenyen" : "Åpne sidemenyen"}
            >
                <span aria-hidden="true">☰</span>
            </button>

            <Sidebar
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
                isOpen={ sidebarOpen }
                onToggle={ () => setSidebarOpen(!sidebarOpen)}
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
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
        </div>
    )
}

export default AppLayout;