import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { studentOnly } from "../middleware/studentOnly";
import { AuthRequest } from "../types/auth.types";
import {
    getCompletedChapters,
    completeChapterSequential
} from "../services/progress.service";
import { supabase } from "../db/supabase";

const router = Router();

router.post(
    "/:chapterId/complete",
    authMiddleware,
    studentOnly,
    async (req: AuthRequest, res: Response) => {
        const chapterId = req.params.chapterId; // keep as string (uuid)
        const userId = req.user!.userId;

        try {
            // Get courseId for this chapter
            const { data: chapter } = await supabase
                .from("chapters")
                .select("course_id")
                .eq("id", chapterId)
                .single();
            const courseId = chapter?.course_id;
            if (!courseId) throw new Error("Course ID not found for chapter");

            // Insert progress row for this chapter, student, and course (if not exists)
            const { data: existing } = await supabase
                .from("progress")
                .select("*")
                .eq("student_id", userId)
                .eq("chapter_id", chapterId)
                .eq("course_id", courseId)
                .single();
            if (!existing) {
                await supabase.from("progress").insert({
                    student_id: userId,
                    chapter_id: chapterId,
                    course_id: courseId
                });
            }

            // Get all completed chapters for this student in this course (only for this course)
            const { data: completedChapters } = await supabase
                .from("progress")
                .select("chapter_id")
                .eq("student_id", userId)
                .eq("course_id", courseId);
            const completedCount = completedChapters ? completedChapters.length : 0;
            // Get actual number of chapters for this course
            const { data: chapters, error: chaptersError } = await supabase
                .from("chapters")
                .select("id")
                .eq("course_id", courseId);
            const totalChapters = chapters ? chapters.length : 1;
            const percentage = Math.floor((completedCount / totalChapters) * 100);
            // Update all progress rows for this student/course with new percentage, completed_chapters, and total_chapters
            await supabase
                .from("progress")
                .update({ 
                    percentage, 
                    completed_chapters: completedCount, 
                    total_chapters: totalChapters, 
                    course_id: courseId
                })
                .eq("student_id", userId)
                .eq("course_id", courseId);
        } catch (err: any) {
            if (err.message === "PREVIOUS") {
                return res
                    .status(403)
                    .json({ message: "Complete previous chapters first" });
            }
            if (err.message === "DUPLICATE") {
                return res
                    .status(403)
                    .json({ message: "Chapter already completed" });
            }
            throw err;
        }

        res.status(200).json({ message: "Chapter completed and progress updated" });
    }
);

router.get(
    "/my",
    authMiddleware,
    studentOnly,
    async (req: AuthRequest, res: Response) => {
        const userId = req.user!.userId;
        const completedChapters = await getCompletedChapters(userId);

        // Find all course_ids for completed chapters
        const { data: chapterCourseRows } = await supabase
            .from("chapters")
            .select("id, course_id")
            .in("id", completedChapters.length ? completedChapters : [""]);

        // If no completed chapters, return sensible defaults
        if (!chapterCourseRows || chapterCourseRows.length === 0) {
            return res.status(200).json({
                completedChapters: [],
                totalChapters: 0,
                percentage: 0
            });
        }

        // Assume the current course is the one with the most completed chapters
        const courseCount: Record<string, number> = {};
        for (const row of chapterCourseRows) {
            courseCount[row.course_id] = (courseCount[row.course_id] || 0) + 1;
        }
        const currentCourseId = Object.entries(courseCount).sort((a, b) => b[1] - a[1])[0][0];
        const completedForCourse = chapterCourseRows.filter(row => row.course_id === currentCourseId).map(row => row.id);

        // Get actual number of chapters for this course
        const { data: chapters, error: chaptersError } = await supabase
            .from("chapters")
            .select("id")
            .eq("course_id", currentCourseId);
        const totalChapters = chapters ? chapters.length : 1;
        const percentage = Math.floor((completedForCourse.length / totalChapters) * 100);

        res.status(200).json({
            completedChapters: completedForCourse,
            totalChapters,
            percentage
        });
    }
);

export default router;
