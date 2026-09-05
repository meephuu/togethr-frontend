import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth need to call under AuthProvider only");
    }

    return context;
};
