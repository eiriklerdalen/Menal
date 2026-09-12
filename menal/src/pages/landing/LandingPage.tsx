import { useNavigate } from "react-router-dom";

import "./LandingHeader.tsx";

import "./LandingPage.css";
import LandingHeader from "./LandingHeader.tsx";

type LandingPageProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

function LandingPage({darkMode, setDarkMode}: LandingPageProps) {
    const navigate = useNavigate();

    return (
        <div className={`landing-page ${darkMode ? "dark-mode" : ""}`}>
            <LandingHeader
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
            />

            <div className="landing-page-content">
                <h1>Bli bedre kjent med dagene dine.</h1>
                <p>Observer humør, vaner og tanker.</p>
            </div>
        </div>
    )
}

export default LandingPage;