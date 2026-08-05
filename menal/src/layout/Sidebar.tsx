import { useNavigate } from "react-router-dom";

import ThemeSwitch from "../components/ThemeSwitch";
import { getDate } from "../utils/date";
import { useAuth } from "../hooks/useAuth.ts";

type SidebarProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    isOpen: boolean;
    onToggle: () => void;
};

function Sidebar({darkMode, setDarkMode, isOpen, onToggle}: SidebarProps) {
    const navigate = useNavigate();

    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <aside className={`sidebar ${isOpen ? "open" : "collapsed"} ${darkMode ? "dark-mode" : ""}`}>
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

            <div className="sidebar-footer">
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logg ut
                </button>

                <ThemeSwitch
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
            </div>
        </aside>
    );
}

export default Sidebar;