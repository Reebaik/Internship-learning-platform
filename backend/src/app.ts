import express from "express";
import coursesRouter from "./routes/courses";

const app = express();
app.use(express.json());

app.use("/api/courses", coursesRouter);

export default app;