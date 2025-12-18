import express from "express";
import coursesRouter from "./routes/courses";
import progressRouter from "./routes/progress";

const app = express();
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);

export default app;
