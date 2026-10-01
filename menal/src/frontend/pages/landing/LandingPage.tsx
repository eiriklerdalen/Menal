import LandingHeader from "./LandingHeader.tsx";
import LandingBox from "./LandingBox.tsx";

import "./LandingPage.css";

import lockIcon from "../../assets/landing/lock.svg";
import lightningIcon from "../../assets/landing/lightning.svg"
import heartIcon from "../../assets/landing/heart.svg";
import chartIcon from "../../assets/landing/chart.svg";

type LandingPageProps = {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

function LandingPage({darkMode, setDarkMode}: LandingPageProps) {
    return (
        <div className={`landing-page ${darkMode ? "dark-mode" : ""}`}>
            <LandingHeader
                darkMode={ darkMode }
                setDarkMode={ setDarkMode }
            />

            <div className="landing-page-content">
                <h1>Bli bedre kjent med dagene dine.</h1>

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
            </div>
        </div>
    )
}

export default LandingPage;
