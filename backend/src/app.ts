import express from "express";
import coursesRouter from "./routes/courses";
import progressRouter from "./routes/progress";
import certificatesRouter from "./routes/certificates";
import mentorRouter from "./routes/mentor";
import { supabase } from "./db/supabase";

const app = express();
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/mentor", mentorRouter);



// 🔍 TEMP: Supabase connection test (REMOVE LATER)
app.get("/debug/supabase", async (_, res) => {
    const { data, error } = await supabase
        .from("progress")
        .select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

export default app;
