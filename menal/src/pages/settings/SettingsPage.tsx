import { useState } from "react";

import useRequiredUser from "../../hooks/useRequiredUser";

import "./SettingsPage.css";

function SettingsPage() {
    const user = useRequiredUser();
    const [name, setName] = useState(user.name);

    return (
        <div className="settings-page">
            <h1>Innstillinger</h1>
            <div className="settings-content">
                <main className="settings-card">
                    <form className="settings-section">
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

                    <form className="settings-section">
                        <h2>Endre passord</h2>

                        <div className="settings-field">
                            <label htmlFor="current-password">Nåværende passord</label>
                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
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
                </main>
            </div>
        </div>
    )
}

export default SettingsPage;
