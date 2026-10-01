import { useState, useEffect } from "react";

import { apiFetch } from "../../frontend/config/apiFetch";
import { clearCSRFToken } from "../../frontend/config/csrf";

import { AuthContext } from "./AuthProvider";

import type { User } from "../types";

export function AuthProvider({ children }: { children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const res = await apiFetch("/me");

                if (!res.ok) {
                    setUser(null);
                    return;
                }

                const user = await res.json();
                setUser(user);
            } catch (err) {
                console.log("Kunne ikke hente bruker:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadCurrentUser();
    }, []);

    function login(user: User) {
        setUser(user);
    }

    function updateUser(updates: Partial<User>) {
        setUser((currentUser) => {
            if (currentUser === null) {
                return null;
            }

            return {
                ...currentUser,
                ...updates,
            };
        });
    }

    async function logout() {
        try {
            await apiFetch("/logout", {
                method: "POST",
            });
        } finally {
            clearCSRFToken();
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                updateUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}