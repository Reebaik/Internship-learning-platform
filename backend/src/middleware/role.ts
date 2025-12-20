import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "../types/auth.types";

export const roleMiddleware = (requiredRole: Role) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // admin bypass
        if (req.user.role === "admin") {
            return next();
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};
