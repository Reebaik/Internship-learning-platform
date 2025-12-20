import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";
import { supabase } from "../db/supabase";

const TOTAL_CHAPTERS = 5;
const router = Router();

router.get(
    "/progress",
    authMiddleware,
    roleMiddleware("mentor"),
    async (_req: AuthRequest, res: Response) => {
        // fetch all progress rows
        const { data, error } = await supabase
            .from("progress")
            .select("student_id, chapter_id");

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        // group by student
        const grouped: Record<string, number> = {};

        for (const row of data) {
            grouped[row.student_id] = (grouped[row.student_id] || 0) + 1;
        }

        const analytics = Object.entries(grouped).map(
            ([studentId, completedCount]) => ({
                studentId,
                completedChapters: completedCount,
                percentage: Math.floor(
                    (completedCount / TOTAL_CHAPTERS) * 100
                )
            })
        );

        res.status(200).json(analytics);
    }
);

export default router;
