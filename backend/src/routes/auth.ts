
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../db/supabase";

const router = Router();

/**
 * ADMIN: Bulk disapprove all mentors
 */
router.post("/admin/mentors/disapprove-all", async (req, res) => {
    const { error } = await supabase
        .from("users")
        .update({ approved: false })
        .eq("role", "mentor");
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: "All mentors set to not approved" });
});

/**
 * ADMIN: Reject (disapprove) mentor
 */
router.post("/admin/users/:id/reject", async (req, res) => {
    const { id } = req.params;
    // Set approved to false (or could delete user, but here we just disapprove)
    const { error } = await supabase
        .from("users")
        .update({ approved: false })
        .eq("id", id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: "User rejected" });
});

/**
 * ADMIN: Course analytics (students enrolled, their progress)
 */
router.get("/admin/course/:courseId/analytics", async (req, res) => {
    // TODO: Add admin auth middleware in production
    const { courseId } = req.params;
    try {
        // Get course info
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, title, total_chapters")
            .eq("id", courseId)
            .single();
        if (courseError || !course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Get enrolled students
        const { data: enrollments } = await supabase
            .from("enrollments")
            .select("student_id")
            .eq("course_id", courseId);
        const studentIds = (enrollments || []).map((e: any) => e.student_id);
        // Get student info
        type Student = { id: string; name: string; email: string };
        let students: Student[] = [];
        if (studentIds.length > 0) {
            const { data: studentData } = await supabase
                .from("users")
                .select("id, name, email")
                .in("id", studentIds);
            students = studentData || [];
        }
        // For each student, get progress
        const analytics = [];
        for (const student of students) {
            // Count chapters completed by this student in this course
            const { data: progressRows } = await supabase
                .from("progress")
                .select("chapter_id")
                .eq("student_id", student.id)
                .eq("course_id", courseId);
            const completedChapters = progressRows ? progressRows.length : 0;
            const percent = course.total_chapters > 0 ? Math.floor((completedChapters / course.total_chapters) * 100) : 0;
            analytics.push({
                student_id: student.id,
                student_name: student.name,
                student_email: student.email,
                completedChapters,
                totalChapters: course.total_chapters,
                percent
            });
        }
        res.json({
            course: { id: course.id, title: course.title, total_chapters: course.total_chapters },
            students: analytics
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Course analytics error" });
    }
});


const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

/**
 * ADMIN: Platform-wide analytics
 */
router.get("/admin/analytics", async (req, res) => {
    // TODO: Add admin auth middleware in production
    try {
        // User counts by role
        const { data: users } = await supabase.from("users").select("role, approved");
        const totalUsers = users?.length || 0;
        const students = users?.filter((u: any) => u.role === "student").length || 0;
        const mentors = users?.filter((u: any) => u.role === "mentor").length || 0;
        const admins = users?.filter((u: any) => u.role === "admin").length || 0;
        const pendingMentors = users?.filter((u: any) => u.role === "mentor" && !u.approved).length || 0;

        // Course count
        const { count: courseCount } = await supabase.from("courses").select("id", { count: "exact", head: true });

        // Completions: count of students who have 100% progress in any course
        // For each course, count students who have completed all chapters
        const { data: courses } = await supabase.from("courses").select("id, total_chapters");
        let completions = 0;
        for (const course of courses || []) {
            if (!course.total_chapters) continue;
            // For each student, count progress
            const { data: progress } = await supabase
                .from("progress")
                .select("student_id, chapter_id")
                .eq("course_id", course.id);
            const byStudent: Record<string, Set<string>> = {};
            for (const row of progress || []) {
                if (!byStudent[row.student_id]) byStudent[row.student_id] = new Set();
                byStudent[row.student_id].add(row.chapter_id);
            }
            for (const chapters of Object.values(byStudent)) {
                if (chapters.size === course.total_chapters) completions++;
            }
        }

        res.json({
            totalUsers,
            students,
            mentors,
            admins,
            pendingMentors,
            courseCount: courseCount || 0,
            completions
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Analytics error" });
    }
});

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const autoApprove = process.env.AUTO_APPROVE_ROLES === "true";

    let approved = false;
    if (role === "student" || role === "admin") {
        approved = true;
    } else if ((role === "mentor") ) {
        approved = false;
    }

    const { error } = await supabase.from("users").insert({
        name,
        email,
        password: hashedPassword,
        role,
        approved
    });

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: "Registered successfully" });
});

/**
 * LOGIN
 */
router.get("/users/students", async (req, res) => {
    // Return all approved students (id, name, email)
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "student")
        .eq("approved", true);
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (!users) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!users.approved) {
        return res.status(403).json({ message: "Account pending approval" });
    }

    const valid = await bcrypt.compare(password, users.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { userId: users.id, role: users.role },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        token,
        role: users.role
    });
});

/**
 * ADMIN: List all users
 */
router.get("/admin/users", async (req, res) => {
    // TODO: Add admin auth middleware in production
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, approved");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

/**
 * ADMIN: Approve user
 */
router.post("/admin/users/:id/approve", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from("users")
        .update({ approved: true })
        .eq("id", id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: "User approved" });
});

/**
 * ADMIN: Delete user
 */
router.delete("/admin/users/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: "User deleted" });
});

/**
 * ADMIN: Change user role
 */
router.post("/admin/users/:id/role", async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: "Missing role" });
    const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: "Role updated" });
});

export default router;
