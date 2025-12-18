import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("mentor"),
    (req, res) => {
        res.status(200).json({ message: "Course created" });
    }
);

export default router;
