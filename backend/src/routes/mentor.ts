import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { progressStore } from "./progress";

const TOTAL_CHAPTERS = 5;
const router = Router();

router.get(
    "/progress",
    authMiddleware,
    roleMiddleware("mentor"),
    (req, res) => {
        const analytics = Object.entries(progressStore).map(
            ([studentId, chapters]) => ({
                studentId,
                completedChapters: chapters.length,
                percentage: Math.floor(
                    (chapters.length / TOTAL_CHAPTERS) * 100
                )
            })
        );

        res.status(200).json(analytics);
    }
);

export default router;
