import { useState } from "react";

import type { SubmitEvent } from "react";

import useRequiredUser from "../../hooks/useRequiredUser";
import { useAuth } from "../../hooks/useAuth";

import "./SettingsPage.css";
import { apiFetch } from "../../config/apiFetch";

function SettingsPage() {
    const { updateUser } = useAuth();

    const user = useRequiredUser();
    const oldName = user.name;
    const [name, setName] = useState(user.name);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    async function handleNameChange(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (name === oldName) {
            setError("Nytt navn kan ikke være likt det gamle.");
            return;
        }

        try {
            const updatedUser = await changeName(name);

            updateUser({
                name: updatedUser.name,
            });
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    }

    return (
        <div className="settings-page">
            <h1>Innstillinger</h1>
            <div className="settings-content">
                <main className="settings-card">
                    <form 
                        className="settings-section"
                        onSubmit={handleNameChange}
                    >
                        <h2>Profil</h2>
                        <div className="settings-field">
                            <label htmlFor="name">Navn</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                maxLength={50}
                                required
                            />
                        </div>

                        <button type="submit">
                            Lagre navn
                        </button>
                    </form>

                    <form 
                        className="settings-section"
                    >
                        <h2>Endre passord</h2>

                        <div className="settings-field">
                            <label htmlFor="current-password">Nåværende passord</label>
                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="settings-field">
                            <label htmlFor="new-password">Nytt passord</label>
                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                required
                            />
                        </div>

                        <div className="settings-field">
                            <label htmlFor="confirm-password">Gjenta nytt passord</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="confirm-password"
                                minLength={8}
                                maxLength={128}
                                required
                            />
                        </div>

                        <button type="submit">
                            Oppdater passord
                        </button>
                    </form>

                    <p 
                        className={`error-message ${error ? "error-message--visible" : ""}`}
                        role="alert"
                        aria-live="polite"
                    >
                        {error || "\u00A0"}
                    </p>
                </main>
            </div>
        </div>
    )
}

async function changeName(newName: string) {
    const res = await apiFetch("/account/name", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: newName,
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? "Kunne ikke endre navn.");
    }

    return data;
}

export default SettingsPage;
