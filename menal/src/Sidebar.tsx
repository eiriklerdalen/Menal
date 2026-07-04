import { useNavigate } from "react-router-dom";

import ThemeSwitch from "./components/ThemeSwitch";
import { getDate } from "./utils/date";

type SidebarProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
};

function Sidebar({darkMode, setDarkMode}: SidebarProps) {
    const navigate = useNavigate();

    return (
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
    );
}

export default Sidebar;