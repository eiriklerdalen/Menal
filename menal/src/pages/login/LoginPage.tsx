import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import { apiURL } from "../../config/api";

import "/src/pages/login/LoginPage.css";

function LoginPage() {
    const { login: authLogin } = useAuth();
    
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: any) {
        e.preventDefault();

        try {
            const user = await login(email, password);

            authLogin(user);

            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleLogin}>
                <h1>Menal</h1>
                <p>Logg inn for å fortsette</p>

                <input
                    type="email"
                    placeholder="E-post"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                />

                <input
                    type="password"
                    placeholder="Passord"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                />

                <p 
                    className={`error-message ${error ? "error-message--visible" : ""}`}
                    role="alert"
                    aria-live="polite"
                >
                    {error || "\u00A0"}
                </p>

                <button type="submit">
                    Logg inn
                </button>
            </form>
            <p className="register-text">
                Har du ikke konto?{" "}
                <span
                    className="register-link"
                    onClick={() => navigate("/register")}
                >
                    Opprett konto
                </span>
            </p>
        </div>
    )
}

async function login(email: string, password: string) {
    const res = await fetch(apiURL("/login"), {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? "Kunne ikke logge inn.");
    }

    return data;
}

export default LoginPage;