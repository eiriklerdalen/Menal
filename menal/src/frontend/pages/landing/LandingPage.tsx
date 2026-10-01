import { useState } from "react";
import { Link } from "react-router-dom";

import LandingSidebar from "./LandingSidebar.tsx";

// import LandingHeader from "./LandingHeader.tsx";
// import LandingBox from "./LandingBox.tsx";

import "./LandingPage.css";

// import lockIcon from "../../assets/landing/lock.svg";
// import lightningIcon from "../../assets/landing/lightning.svg"
// import heartIcon from "../../assets/landing/heart.svg";
// import chartIcon from "../../assets/landing/chart.svg";

type LandingPageProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

function LandingPage({darkMode, setDarkMode}: LandingPageProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`landing-page ${darkMode ? "dark-mode" : ""}`}>
            <LandingSidebar
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
                sidebarOpen={ sidebarOpen }
                setSidebarOpen={ setSidebarOpen }
            />

            <main className="landing-page-content">
                <h1 className="landing-page-title">
                    <span className="landing-page-name">Menal</span>
                    <span>Enkelt, sikkert og gratis journalsverktøy</span>
                </h1>

                <p className="landing-page-description">
                    Bli bedre kjent med dagene dine.
                </p>

                <Link className="landing-page-login-link" to="/login">
                    Bli med i dag
                </Link>

                {/*
                <LandingHeader
                    darkMode={ darkMode }
                    setDarkMode={ setDarkMode }
                />

                <div className="info-boxes">
                    <LandingBox
                        imagePath={ lockIcon }
                        darkMode={ darkMode }
                        text="Privat"
                    />
                    <LandingBox
                        imagePath={ lightningIcon }
                        darkMode={ darkMode }
                        text="Enkelt"
                    />
                    <LandingBox
                        imagePath={ heartIcon }
                        darkMode={ darkMode }
                        text="Ditt tempo"
                    />
                    <LandingBox
                        imagePath={ chartIcon }
                        darkMode={ darkMode }
                        text="Oversikt"
                    />
                </div>
                */}
            </main>

            <footer className="landing-page-footer">
                © 2026 Eirik Lerdalen
            </footer>
        </div>
    )
}

export default LandingPage;
