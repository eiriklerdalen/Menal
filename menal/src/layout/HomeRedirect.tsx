import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.ts";

function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (user) {
        return <Navigate to="/dashboard" replace/>
    }

    return <Navigate to="/login" replace/>
}

export default HomeRedirect;