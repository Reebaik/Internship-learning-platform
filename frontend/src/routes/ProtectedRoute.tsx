import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

type Role = "student" | "mentor" | "admin";

type Props = {
    allowedRoles: Role[];
    children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: Props) {
    const { auth } = useAuth();

    if (!auth.token || !auth.role) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(auth.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
