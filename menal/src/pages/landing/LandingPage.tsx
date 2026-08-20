import { useNavigate } from "react-router-dom";

import "./LandingPage.css";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <header className="landing-page-header">
                <button
                    type="button"
                    className="menal-title"
                    onClick={() => navigate("/")}
                >
                    <img 
                        src="/favicon-menal-small.svg"
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
                </nav>
            </header>
        </div>
    )
}

export default LandingPage;