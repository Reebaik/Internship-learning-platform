
import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";
import { supabase } from "../db/supabase";

const router = Router();

// ASSIGN STUDENTS TO COURSE (mentor only, owns course)
// POST /api/courses/:courseId/assign
// Body: { studentIds: string[] }
router.post(
    "/:courseId/assign",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { courseId } = req.params;
        const { studentIds } = req.body;
        const mentorId = req.user!.userId;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: "No students provided" });
        }
        // Check if course exists and belongs to mentor
        const { data: course, error } = await supabase
            .from("courses")
            .select("id, mentor_id")
            .eq("id", courseId)
            .single();
        if (error || !course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.mentor_id !== mentorId) {
            return res.status(403).json({ message: "Not authorized to assign students to this course" });
        }
        // Insert enrollments (ignore duplicates)
        const inserts = studentIds.map((student_id: string) => ({ course_id: courseId, student_id }));
        const { error: insertError } = await supabase
            .from("enrollments")
            .upsert(inserts, { onConflict: "course_id,student_id" });
        if (insertError) {
            return res.status(500).json({ message: insertError.message });
        }
        res.status(201).json({ message: "Students assigned successfully" });
    }
);

/**
 * UPDATE COURSE (mentor only, owns course)
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const mentorId = req.user!.userId;
        const { title, description, total_chapters } = req.body;

        // Check if course exists and belongs to mentor
        const { data: course, error } = await supabase
            .from("courses")
            .select("id, mentor_id")
            .eq("id", id)
            .single();
        if (error || !course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.mentor_id !== mentorId) {
            return res.status(403).json({ message: "Not authorized to update this course" });
        }

        // Update course
        const { error: updateError } = await supabase
            .from("courses")
            .update({ title, description, total_chapters })
            .eq("id", id);
        if (updateError) {
            return res.status(500).json({ message: updateError.message });
        }
        res.status(200).json({ message: "Course updated successfully" });
    }
);


/**
 * GET MY COURSES (mentor)
 */
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        console.log("[DEBUG] /api/courses/my hit", {
            user: req.user,
            method: req.method,
            url: req.originalUrl
        });
        const { data, error } = await supabase
            .from("courses")
            .select("id, title, description, total_chapters")
            .eq("mentor_id", req.user!.userId);

        if (error) {
            console.error("[DEBUG] Supabase error in /my", error);
            return res.status(500).json({ message: error.message });
        }

        console.log("[DEBUG] /api/courses/my result", data);
        res.json(data);
    }
);

/**
 * GET course details by id (public)
 */
router.get(
    "/:id",
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("courses")
            .select("id, title, description, total_chapters, mentor_id")
            .eq("id", id)
            .single();
        if (error || !data) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Get mentor name
        let mentorName = "TBD";
        if (data.mentor_id) {
            const { data: mentor } = await supabase
                .from("users")
                .select("name")
                .eq("id", data.mentor_id)
                .single();
            if (mentor) mentorName = mentor.name;
        }
        res.json({
            id: data.id,
            title: data.title,
            description: data.description,
            total_chapters: data.total_chapters,
            mentor_name: mentorName
        });
    }
);

/**
 * GET all courses a student is enrolled in
 */
router.get(
    "/student/my-courses",
    authMiddleware,
    roleMiddleware("student"),
    async (req: AuthRequest, res: Response) => {
        const studentId = req.user!.userId;
        // Get enrollments for this student
        const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select("course_id")
            .eq("student_id", studentId);
        if (enrollError) {
            return res.status(500).json({ message: enrollError.message });
        }
        const courseIds = (enrollments || []).map((e: any) => e.course_id);
        if (courseIds.length === 0) return res.json([]);
        // Get course details
        const { data: courses, error } = await supabase
            .from("courses")
            .select("id, title, description, mentor_id")
            .in("id", courseIds);
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        // Get mentor names
        const mentorIds = [...new Set((courses || []).map((c: any) => c.mentor_id))];
        let mentors: any = [];
        if (mentorIds.length > 0) {
            const { data: mentorData } = await supabase
                .from("users")
                .select("id, name")
                .in("id", mentorIds);
            mentors = mentorData || [];
        }
        // For each course, expose both total_chapters (from courses table) and actual_chapters (from chapters table), and both percent and percent_actual
        const formatted = [];
        for (const c of courses || []) {
            // Get total_chapters from courses table (already selected)
            const { data: courseRow } = await supabase
                .from("courses")
                .select("total_chapters")
                .eq("id", c.id)
                .single();
            const total_chapters = courseRow?.total_chapters || 0;
            // Get actual number of chapters in chapters table
            const { data: chapters } = await supabase
                .from("chapters")
                .select("id")
                .eq("course_id", c.id);
            const actual_chapters = chapters ? chapters.length : 0;
            // Get completed chapters for this student in this course
            const { data: completed } = await supabase
                .from("progress")
                .select("chapter_id")
                .eq("student_id", studentId)
                .eq("course_id", c.id);
            const completed_chapters = completed ? completed.map((row: any) => row.chapter_id) : [];
            // Calculate percent (use total_chapters from courses table)
            let percent = 0;
            if (total_chapters > 0) {
                percent = Math.round((completed_chapters.length / total_chapters) * 100);
            }
            // Calculate percent_actual (using actual_chapters)
            let percent_actual = 0;
            if (actual_chapters > 0) {
                percent_actual = Math.round((completed_chapters.length / actual_chapters) * 100);
            }
            formatted.push({
                id: c.id,
                title: c.title,
                description: c.description,
                total_chapters,
                actual_chapters,
                completed_chapters,
                percent, // percent of total_chapters
                percent_actual, // percent of actual chapters added
                mentor_name: mentors.find((m: any) => m.id === c.mentor_id)?.name || "TBD"
            });
        }
        res.json(formatted);
    }
);
// Prevent duplicate enrollments at DB level (add unique constraint in migration, but also check here)
// Already handled in POST /:courseId/enroll

// Mentor analytics: GET /mentor/analytics (move to mentor.ts if not present)
// Here is a sample endpoint for mentor analytics with course_name
import { Router as MentorRouter } from "express";
const mentorRouter = MentorRouter();

/**
 * GET mentor analytics: students' progress per course (with course_name)
 */
mentorRouter.get(
    "/analytics",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const mentorId = req.user!.userId;
        // Get all courses for this mentor
        const { data: courses, error: courseError } = await supabase
            .from("courses")
            .select("id, title")
            .eq("mentor_id", mentorId);
        if (courseError) {
            return res.status(500).json({ message: courseError.message });
        }
        // For each course, get students and their progress
        const analytics = [];
        for (const course of courses || []) {
            // Get actual number of chapters for this course
            const { data: chapters, error: chaptersError } = await supabase
                .from("chapters")
                .select("id")
                .eq("course_id", course.id);
            const actualTotalChapters = chapters ? chapters.length : 0;
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
                // Get progress
                const { data: progress } = await supabase
                    .from("progress")
                    .select("completed_chapters")
                    .eq("student_id", enrollment.student_id)
                    .eq("course_id", course.id)
                    .single();
                let percent = 0;
                if (actualTotalChapters > 0 && progress && progress.completed_chapters) {
                    percent = Math.round((progress.completed_chapters.length / actualTotalChapters) * 100);
                }
                analytics.push({
                    course_id: course.id,
                    course_name: course.title,
                    student_id: enrollment.student_id,
                    student_name: student?.name,
                    percent,
                    completed_chapters: progress?.completed_chapters?.length || 0,
                    total_chapters: actualTotalChapters
                });
            }
        }
        res.json(analytics);
    }
);

// Export mentorRouter if not already
export { mentorRouter };
/**
 * GET chapters for a course (student, sequential, only if enrolled)
 */
router.get(
    "/:courseId/chapters",
    authMiddleware,
    roleMiddleware("student"),
    async (req: AuthRequest, res: Response) => {
        const { courseId } = req.params;
        const studentId = req.user!.userId;

        // Check enrollment
        const { data: enrolled, error: enrollError } = await supabase
            .from("enrollments")
            .select("*")
            .eq("course_id", courseId)
            .eq("student_id", studentId)
            .single();
        if (!enrolled) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        // Fetch chapters in order
        const { data: chapters, error } = await supabase
            .from("chapters")
            .select("id, title, video_url, sequence_order")
            .eq("course_id", courseId)
            .order("sequence_order");

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(chapters);
    }
);



/**
 * ENROLL IN COURSE (student only)
 */
router.post(
    "/:courseId/enroll",
    authMiddleware,
    roleMiddleware("student"),
    async (req: AuthRequest, res: Response) => {
        const { courseId } = req.params;
        const studentId = req.user!.userId;

        // Check if already enrolled
        const { data: existing, error: fetchError } = await supabase
            .from("enrollments")
            .select("*")
            .eq("course_id", courseId)
            .eq("student_id", studentId)
            .single();

        if (existing) {
            return res.status(200).json({ message: "Already enrolled" });
        }
        if (fetchError && fetchError.code !== "PGRST116") {
            // Not found is ok, any other error is not
            return res.status(400).json({ message: fetchError.message });
        }

        // Enroll student
        const { error } = await supabase
            .from("enrollments")
            .insert({ course_id: courseId, student_id: studentId });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json({ message: "Enrolled successfully" });
    }
);

/**
 * CREATE COURSE (mentor only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { title, description, total_chapters } = req.body;

        if (!title || !description || !total_chapters) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const mentorId = req.user!.userId;

        const { data, error } = await supabase
            .from("courses")
            .insert({
                title,
                description,
                total_chapters,
                mentor_id: mentorId
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json(data);
    }
);
/**
 * GET COURSES (public)
 */
router.get("/", async (_, res) => {
        const { data, error } = await supabase
                .from("courses")
                .select(`
            id,
            title,
            description,
            total_chapters,
            users:mentor_id(name)
        `);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    const formatted = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        total_chapters: c.total_chapters,
        mentor_name: c.users?.name
    }));

    res.json(formatted);
});


export default router;

/**
 * DELETE COURSE (mentor only, owns course)
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const mentorId = req.user!.userId;
        // Check if course exists and belongs to mentor
        const { data, error } = await supabase
            .from("courses")
            .select("id, mentor_id")
            .eq("id", id)
            .single();
        if (error || !data) {
            console.error("[DEBUG] /api/courses/:id not found", { error, id });
            return res.status(404).json({ message: "Course not found" });
        }
        if (data.mentor_id !== mentorId) {
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }
        // Delete dependent rows first (enrollments, chapters, progress)
        await supabase.from("progress").delete().eq("course_id", id);
        await supabase.from("enrollments").delete().eq("course_id", id);
        await supabase.from("chapters").delete().eq("course_id", id);
        // Delete course
        const { error: deleteError } = await supabase
            .from("courses")
            .delete()
            .eq("id", id);
        if (deleteError) {
            return res.status(500).json({ message: deleteError.message });
        }
        res.status(200).json({ message: "Course deleted successfully" });
    }
);