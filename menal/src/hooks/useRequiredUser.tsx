import { useAuth } from "../contexts/AuthContext";

function useRequiredUser() {
    const { user } = useAuth();

    if (!user) {
        throw new Error("useRequiredUser called without authenticated user.");
    }

    return user;
}

export default useRequiredUser;