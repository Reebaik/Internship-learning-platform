import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";
import { supabase } from "../db/supabase";

const TOTAL_CHAPTERS = 5;
const router = Router();

router.get(
    "/analytics",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        try {
            const mentorId = req.user!.userId;
            // Get all courses for this mentor
            const { data: courses, error: courseError } = await supabase
                .from("courses")
                .select("id, title, total_chapters")
                .eq("mentor_id", mentorId);
            if (courseError) {
                return res.status(500).json({ message: courseError.message });
            }
            // For each course, get enrolled students and their progress
            let analytics: any[] = [];
            for (const course of courses || []) {
                // Get enrolled students
                const { data: enrollments } = await supabase
                    .from("enrollments")
                    .select("student_id")
                    .eq("course_id", course.id);
                for (const enrollment of enrollments || []) {
                    // Get student name
                    const { data: student } = await supabase
                        .from("users")
                        .select("name")
                        .eq("id", enrollment.student_id)
                        .single();
                    // Count number of chapters completed by this student in this course
                    const { data: progressRows } = await supabase
                        .from("progress")
                        .select("chapter_id")
                        .eq("student_id", enrollment.student_id)
                        .eq("course_id", course.id);
                    const completedChapters = progressRows ? progressRows.length : 0;
                    const totalChapters = course.total_chapters || 1;
                    const percent = Math.floor((completedChapters / totalChapters) * 100);
                    analytics.push({
                        course_id: course.id,
                        course_name: course.title,
                        student_id: enrollment.student_id,
                        student_name: student?.name,
                        completedChapters,
                        totalChapters,
                        percent
                    });
                }
            }
            res.json(analytics);
        } catch (err) {
            console.error("Mentor analytics unexpected error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default router;
