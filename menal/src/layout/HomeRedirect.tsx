import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

function HomeRedirect() {
    const user = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace/>
    }

    return <Navigate to="/login" replace/>
}

export default HomeRedirect;