import { useAuth } from "./useAuth";

function useRequiredUser() {
    const { user } = useAuth();

    if (!user) {
        throw new Error("useRequiredUser called without authenticated user.");
    }

    return user;
}

export default useRequiredUser;