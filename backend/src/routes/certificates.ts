import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { studentOnly } from "../middleware/studentOnly";

// SAME store used by progress route
import { progressStore } from "./progress";

const TOTAL_CHAPTERS = 5;

const router = Router();

router.get(
    "/:courseId",
    authMiddleware,
    studentOnly,
    (req, res) => {
        const userId = req.user!.userId;
        const completedChapters = progressStore[userId] || [];

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
