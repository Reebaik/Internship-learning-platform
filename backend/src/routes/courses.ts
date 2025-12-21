import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { AuthRequest } from "../types/auth.types";
import { supabase } from "../db/supabase";

const router = Router();

/**
 * CREATE COURSE (Mentor only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    async (req: AuthRequest, res: Response) => {
        const { title, description } = req.body;
        const mentorId = req.user!.userId;

        if (!title || !description) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const { data, error } = await supabase
            .from("courses")
            .insert({
                title,
                description,
                mentor_id: mentorId
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json(data);
    }
);

/**
 * GET ALL COURSES (Public)
 */
router.get("/", async (_, res) => {
    const { data, error } = await supabase
        .from("courses")
        .select(`
      id,
      title,
      description,
      mentor:users(name),
      chapters(count)
    `);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    // Shape data for frontend
    const formatted = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        mentor_name: c.mentor?.name ?? "Unknown",
        total_chapters: c.chapters?.[0]?.count ?? 0
    }));

    res.json(formatted);
});

export default router;
