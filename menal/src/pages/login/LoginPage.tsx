import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { SubmitEvent } from "react";

import { useAuth } from "../../hooks/useAuth.ts";

import { clearCSRFToken } from "../../config/csrf";
import { apiFetch } from "../../config/apiFetch";

import "/src/pages/login/LoginPage.css";

type LoginPageProps = {
    darkMode: boolean;
}

function LoginPage({ darkMode }: LoginPageProps) {
    const { login: authLogin } = useAuth();
    
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: SubmitEvent<HTMLFormElement>) {
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
        <div className={`login-page ${darkMode ? "dark-mode" : ""}`}>
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
    const res = await apiFetch("/login", {
        method: "POST",
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

    clearCSRFToken();

    return data;
}

export default LoginPage;