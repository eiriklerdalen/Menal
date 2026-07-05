import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./RegisterPage.css"

function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleRegistration(e: any) {
        e.preventDefault();
    }

    return (
        <div className="register-page">
            <form className="register-card" onSubmit={handleRegistration}>
                <h1>Menal</h1>
                <p>Registrer bruker for å fortsette</p>

                <input
                    type="email"
                    placeholder="E-post"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="name"
                    placeholder="Ditt navn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Passord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Bekreft passord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button>
                    Opprett bruker
                </button>
            </form>
            <p className="login-text">
                Har du allerede konto?{" "}
                <span
                    className="login-link"
                    onClick={() => navigate("/login")}
                >
                    Logg inn
                </span>
            </p>
        </div>
    )
}

export default RegisterPage;