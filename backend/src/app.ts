import express from "express";
import coursesRouter from "./routes/courses";
import progressRouter from "./routes/progress";
import certificatesRouter from "./routes/certificates";
import mentorRouter from "./routes/mentor";
import authRoutes from "./routes/auth";
import cors from "cors";
import chaptersRouter from "./routes/chapters";



const frontendOrigin = process.env.FRONTEND_ORIGIN;

if (!frontendOrigin) {
    throw new Error("FRONTEND_ORIGIN is not defined");
}



const app = express();

app.use(express.json());
console.log("CORS origin:", process.env.FRONTEND_ORIGIN);
app.use(
    cors({
        origin: frontendOrigin,
        credentials: true
    })
);
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/chapters", chaptersRouter);



// Global error handler: log and always return JSON
import { Request, Response, NextFunction } from "express";

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;
