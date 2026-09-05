import { useState } from "react";
import { AuthContext } from "./auth-context";

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(getStoredUser);
    const isAuthenticated = !!user;

    const setUser = (nextUser) => {
        setUserState(nextUser);

        if (nextUser) {
            localStorage.setItem("user", JSON.stringify(nextUser));
        } else {
            localStorage.removeItem("user");
        }
    };

    const value = { user, setUser, isAuthenticated };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
