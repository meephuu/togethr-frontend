import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // TODO: ยังเป็น mockup อยู่ ยังไม่เช็ค token/login จริง
    const [user, setUser] = useState(null);
    const isAuthenticated = !!user;

    const value = { user, setUser, isAuthenticated };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}