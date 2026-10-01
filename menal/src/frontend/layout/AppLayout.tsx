import { lazy, useState } from "react";
import { Route, Routes } from "react-router-dom";

import DashboardPage from "../pages/dashboard/DashboardPage";
import OverviewPage from "../pages/overview/OverviewPage";
import YearOverviewPage from "../pages/overview/YearOverviewPage";
import LogPage from "../pages/log/LogPage";
import NewCalendarPage from "../pages/calendars/new_calendar/NewCalendarPage"
import EditCalendarPage from "../pages/calendars/edit_calendar/EditCalendarPage";
import SettingsPage from "../pages/settings/SettingsPage";

import Sidebar from "./Sidebar";

const CalendarPage = lazy(() => import("../pages/calendars/CalendarsPage"))

type AppLayoutProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
};

function AppLayout({darkMode, setDarkMode}: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return true;
        }

        return !window.matchMedia("(max-width: 700px)").matches;
    });

    return (
        <div className={`app-layout ${sidebarOpen ? "" : "sidebar-collapsed"} ${darkMode ? "dark-mode" : ""}`}>

            <header className="mobile-header">
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-expanded={sidebarOpen}
                    aria-label={sidebarOpen ? "Lukk sidemenyen" : "Åpne sidemenyen"}
                >
                    <span aria-hidden="true">☰</span>
                </button>
            </header>

            <Sidebar
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
                isOpen={ sidebarOpen }
                onNavigate={() => {
                    if (
                        typeof window.matchMedia === "function"
                        && window.matchMedia("(max-width: 700px)").matches
                    ) {
                        setSidebarOpen(false);
                    }
                }}
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
