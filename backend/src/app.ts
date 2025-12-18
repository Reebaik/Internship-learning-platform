import express from "express";

const app = express();

// middleware
app.use(express.json());

// temporary test route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

export default app;

