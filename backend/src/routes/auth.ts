import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../db/supabase";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const autoApprove = process.env.AUTO_APPROVE_ROLES === "true";

    let approved = role === "student";
    if ((role === "mentor" || role === "admin") && autoApprove) {
        approved = true;
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

export default router;
