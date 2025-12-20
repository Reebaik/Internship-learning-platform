import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { studentOnly } from "../middleware/studentOnly";
import { AuthRequest } from "../types/auth.types";
import {
    getCompletedChapters,
    completeChapter
} from "../services/progress.service";

const router = Router();

router.post(
    "/:chapterId/complete",
    authMiddleware,
    studentOnly,
    async (req: AuthRequest, res: Response) => {
        const chapterId = Number(req.params.chapterId);
        const userId = req.user!.userId;

        const completedChapters = await getCompletedChapters(userId);

        if (chapterId > 1 && !completedChapters.includes(chapterId - 1)) {
            return res
                .status(403)
                .json({ message: "Complete previous chapters first" });
        }

        try {
            await completeChapter(userId, chapterId);
        } catch (err: any) {
            if (err.message === "DUPLICATE") {
                return res
                    .status(403)
                    .json({ message: "Chapter already completed" });
            }
            throw err;
        }

        res.status(200).json({ message: "Chapter completed" });
    }
);

router.get(
    "/my",
    authMiddleware,
    studentOnly,
    async (req: AuthRequest, res: Response) => {
        const userId = req.user!.userId;
        const completedChapters = await getCompletedChapters(userId);

        const TOTAL_CHAPTERS = 5;
        const percentage = Math.floor(
            (completedChapters.length / TOTAL_CHAPTERS) * 100
        );

        res.status(200).json({
            completedChapters: completedChapters.length,
            totalChapters: TOTAL_CHAPTERS,
            percentage
        });
    }
);

export default router;
