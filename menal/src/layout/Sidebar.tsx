import { useNavigate } from "react-router-dom";

import ThemeSwitch from "../components/ThemeSwitch";
import { getDate } from "../utils/date";
import { useAuth } from "../hooks/useAuth.ts";

type SidebarProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    isOpen: boolean;
    onNavigate: () => void;
};

function Sidebar({darkMode, setDarkMode, isOpen, onNavigate}: SidebarProps) {
    const navigate = useNavigate();

    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    function handleNavigation(path: string) {
        navigate(path);
        onNavigate();
    }

    return (
        <aside className={`sidebar ${isOpen ? "open" : "collapsed"} ${darkMode ? "dark-mode" : ""}`}>
            <h1
                className="menal-title"
                onClick={() => handleNavigation("/")}
            >
                Menal
            </h1>

            <nav>
                <button onClick={() => handleNavigation("/dashboard")}>Dashbord</button>
                <button onClick={() => handleNavigation("/overview")}>Oversikt</button>
                <button onClick={() => handleNavigation(`/log/${getDate()}`)}>Logg</button>
                <button onClick={() => handleNavigation("/calendars")}>Kalendre</button>
                <button onClick={() => handleNavigation("/settings")}>Innstillinger</button>
            </nav>

            <div className="sidebar-footer">

                <ThemeSwitch
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
                
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logg ut
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
