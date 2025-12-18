import { Request, Response, NextFunction } from "express";

type Role = "student" | "mentor" | "admin";

export const roleMiddleware = (requiredRole: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // ✅ Admin bypass
        if (req.user.role === "admin") {
            return next();
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};
