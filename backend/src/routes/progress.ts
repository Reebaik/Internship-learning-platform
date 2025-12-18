import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { studentOnly } from "../middleware/studentOnly";

const router = Router();

const progressStore: Record<string, number[]> = {};

router.post(
    "/:chapterId/complete",
    authMiddleware,
    studentOnly,
    (req, res) => {
        const chapterId = Number(req.params.chapterId);
        const userId = req.user!.userId;

        const completedChapters = progressStore[userId] || [];

        if (completedChapters.includes(chapterId)) {
            return res
                .status(403)
                .json({ message: "Chapter already completed" });
        }

        if (chapterId > 1 && !completedChapters.includes(chapterId - 1)) {
            return res
                .status(403)
                .json({ message: "Complete previous chapters first" });
        }

        completedChapters.push(chapterId);
        progressStore[userId] = completedChapters;

        res.status(200).json({ message: "Chapter completed" });
    }
);



const TOTAL_CHAPTERS = 5;
router.get(
    "/my",
    authMiddleware,
    studentOnly,
    (req, res) => {
        const userId = req.user!.userId;
        const completedChapters = progressStore[userId] || [];

        const completedCount = completedChapters.length;
        const percentage = Math.floor(
            (completedCount / TOTAL_CHAPTERS) * 100
        );

        res.status(200).json({
            completedChapters: completedCount,
            totalChapters: TOTAL_CHAPTERS,
            percentage
        });
    }
);


export default router;
