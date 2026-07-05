import { Navigate } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext.tsx";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;