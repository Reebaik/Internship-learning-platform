import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    (req: AuthRequest, res: Response) => {
        res.status(200).json({ message: "Course created" });
    }
);

export default router;
