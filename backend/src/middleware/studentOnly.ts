import { Request, Response, NextFunction } from "express";

export const studentOnly = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};
