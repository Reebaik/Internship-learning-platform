import { createContext, useContext, useState } from "react";

type Role = "student" | "mentor" | "admin";

type AuthState = {
    token: string | null;
    role: Role | null;
};

const AuthContext = createContext<any>(null);

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
        localStorage.clear();
        setAuth({ token: null, role: null });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
