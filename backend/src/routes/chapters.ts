import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";
import { supabase } from "../db/supabase";

const router = Router();

/**
 * GET chapters for a course
 */
router.get(
    "/:courseId",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { courseId } = req.params;

        const { data, error } = await supabase
            .from("chapters")
            .select("*")
            .eq("course_id", courseId)
            .order("sequence_order");

        if (error) {
            console.error("Supabase error in GET /api/chapters/:courseId:", error);
            console.error("Supabase data:", data);
            return res.status(400).json({ message: error.message });
        }

        // Debug: log data for empty/non-empty
        console.log("Chapters data for course", courseId, ":", data);
        // Return empty array if no chapters found (valid course)
        res.json(data || []);
    }
);

/**
 * CREATE chapter
 */
router.post(
    "/:courseId",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { courseId } = req.params;
        const { title, video_url, sequence_order, image_url, content } = req.body;

        // Debug log incoming data
        console.log("POST /api/chapters/:courseId body:", req.body);

        if (!title || !sequence_order) {
            console.error("Missing fields", { title, sequence_order });
            return res.status(400).json({ message: "Missing fields" });
        }

        // Fetch course to get total_chapters and mentor_id
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, mentor_id, total_chapters")
            .eq("id", courseId)
            .single();
        if (courseError || !course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Only allow mentor to add chapters to their own course
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        if (course.mentor_id !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Count current chapters for this course
        const { count: currentChapterCount, error: countError } = await supabase
            .from("chapters")
            .select("id", { count: "exact", head: true })
            .eq("course_id", courseId);
        if (countError) {
            return res.status(500).json({ message: "Failed to check chapter count" });
        }
        if ((currentChapterCount ?? 0) >= course.total_chapters) {
            return res.status(400).json({ message: `Cannot add more than ${course.total_chapters} chapters to this course.` });
        }

        const { error } = await supabase.from("chapters").insert({
            course_id: courseId,
            title,
            video_url,
            sequence_order,
            image_url,
            content
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json({ message: "Chapter created" });
    }
);

/**
 * DELETE chapter
 */
router.delete(
    "/:chapterId",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { chapterId } = req.params;

        // First, delete all progress entries for this chapter
        const { error: progressError } = await supabase
            .from("progress")
            .delete()
            .eq("chapter_id", chapterId);
        if (progressError) {
            return res.status(400).json({ message: progressError.message });
        }

        // Now delete the chapter itself
        const { error } = await supabase
            .from("chapters")
            .delete()
            .eq("id", chapterId);

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        res.json({ message: "Chapter deleted" });
    }
);

export default router;