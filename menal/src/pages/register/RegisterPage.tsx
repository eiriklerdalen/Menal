import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { SubmitEvent } from "react";

import { useAuth } from "../../hooks/useAuth.ts";

import { apiFetch } from "../../config/apiFetch";
import { clearCSRFToken } from "../../config/csrf";

import "./RegisterPage.css"

type RegisterPageProps = {
    darkMode: boolean;
}

function RegisterPage({ darkMode }: RegisterPageProps) {
    const { login: authLogin } = useAuth();

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [error, setError] = useState("");

    async function handleRegistration(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passordene er ikke like.");
            return;
        }

        try {
            const user = await register(email, name, password, confirmPassword);

            authLogin(user);
            navigate("/dashboard");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    }

    return (
        <div className={`register-page ${darkMode ? "dark-mode" : ""}`}>
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

                <p 
                    className={`error-message ${error ? "error-message--visible" : ""}`}
                    role="alert"
                    aria-live="polite"
                >
                    {error || "\u00A0"}
                </p>

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

async function register(email: string, name: string, password: string, confirmPassword: string) {
    const res = await apiFetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            name,
            password,
            confirmPassword,
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error);
    }

    clearCSRFToken();

    return data;
}

export default RegisterPage;