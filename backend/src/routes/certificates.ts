import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { studentOnly } from "../middleware/studentOnly";
import { AuthRequest } from "../types/auth.types";
import { getCompletedChapters } from "../services/progress.service";

const TOTAL_CHAPTERS = 5;

const router = Router();

router.get(
    "/:courseId",
    authMiddleware,
    studentOnly,
    async (req: AuthRequest, res: Response) => {
        const userId = req.user!.userId;

        const completedChapters = await getCompletedChapters(userId);

        if (completedChapters.length < TOTAL_CHAPTERS) {
            return res.status(403).json({
                message: "Course not completed"
            });
        }

        // dummy certificate response (PDF later)
        res.status(200).json({
            message: "Certificate generated",
            studentId: userId,
            courseId: req.params.courseId
        });
    }
);

export default router;
