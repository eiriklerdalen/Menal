import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "/src/pages/login/LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleLogin(e: any) {
        e.preventDefault();

        if (email.trim() && password.trim()) {
            navigate("/dashboard");
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
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Passord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Logg inn
                </button>
            </form>
        </div>
    )
}

export default LoginPage;