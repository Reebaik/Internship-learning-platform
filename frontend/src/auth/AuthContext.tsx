import { createContext, useContext, useState } from "react";

type Role = "student" | "mentor" | "admin";

type AuthState = {
    token: string | null;
    role: Role | null;
};

type AuthContextType = {
    auth: AuthState;
    login: (token: string, role: Role) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        token: localStorage.getItem("token"),
        role: localStorage.getItem("role") as Role | null
    });

    const login = (token: string, role: Role) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setAuth({ token, role });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setAuth({ token: null, role: null });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
