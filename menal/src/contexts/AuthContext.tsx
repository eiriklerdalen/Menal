import { createContext, useContext, useState, useEffect } from "react";

import { apiURL } from "../config/api";
import { apiFetch } from "../config/apiFetch";
import { clearCSRFToken } from "../config/csrf";

type User = {
    id: number;
    userId: number;
    name: string;
    email: string;
}

type AuthContextType = {
    user: User | null;
    loading: boolean;
    //isLoggedIn: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const res = await fetch(apiURL("/me"), {
                    credentials: "include",
                });

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
                //isLoggedIn: user !== null,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}