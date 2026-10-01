import { useNavigate } from "react-router-dom";
import ThemeSwitch from "../../components/ThemeSwitch";

import faviconSmall from "../../assets/favicon-menal-small.svg";

import "./LandingHeader.css";

type LandingHeaderProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

function LandingHeader({darkMode, setDarkMode}: LandingHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className={`landing-page-header ${darkMode ? "dark-mode" : ""}`}>
            <button
                type="button"
                className="menal-title"
                onClick={() => navigate("/")}
            >
                <img 
                    src={ faviconSmall }
                    alt=""
                    aria-hidden="true" 
                />
                <span>
                    Menal
                </span>
            </button>

            <nav className="registration">
                <button
                    type="button"
                    className="sign-in-button"
                    onClick={() => navigate("/login")}
                >
                    Logg inn
                </button>

                <button
                    type="button"
                    className="register-button"
                    onClick={() => navigate("/register")}
                >
                    Opprett konto
                </button>

                <ThemeSwitch
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
            </nav>
        </header>
    )
}

export default LandingHeader