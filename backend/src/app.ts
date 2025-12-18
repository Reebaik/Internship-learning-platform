import express from "express";
import coursesRouter from "./routes/courses";
import progressRouter from "./routes/progress";
import certificatesRouter from "./routes/certificates";
import mentorRouter from "./routes/mentor";

const app = express();
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/mentor", mentorRouter);


export default app;
