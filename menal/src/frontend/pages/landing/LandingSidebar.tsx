import { useNavigate } from "react-router-dom";

import ThemeSwitch from "../../components/ThemeSwitch";

import "./LandingSidebar.css";

type LandingSidebarProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
}

function LandingSidebar({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }: LandingSidebarProps) {
    const navigate = useNavigate();

    return (
        <>
            <aside className={`landing-sidebar ${sidebarOpen ? "open" : ""}`}>
                <nav>
                    <button onClick={() => navigate("/login")}>Logg inn</button>
                    <button onClick={() => navigate("/register")}>Opprett konto</button>
                </nav>

                <div className="landing-sidebar-footer">
                    <ThemeSwitch
                        darkMode={ darkMode }
                        setDarkMode={ setDarkMode }
                    />
                </div>
            </aside>

            <button
                type="button"
                className={`landing-sidebar-toggle ${sidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-expanded={ sidebarOpen }
                aria-label={ sidebarOpen ? "Lukk sidemenyen" : "Åpne sidemenyen" }
            >
                {sidebarOpen ? "‹" : "›"}
            </button>
        </>
    )
}

export default LandingSidebar;
