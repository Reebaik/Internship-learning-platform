import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({
    children,
    allowedRoles
}: {
    children: ReactNode;
    allowedRoles: string[];
}) {
    const { auth } = useAuth();

    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(auth.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}
