import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types"

export const studentOnly = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};
