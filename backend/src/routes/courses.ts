import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Course created" });
});

export default router;
