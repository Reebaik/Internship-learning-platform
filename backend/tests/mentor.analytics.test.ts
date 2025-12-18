import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Mentor analytics - view student progress", () => {
    const mentorToken = jwt.sign(
        { userId: "mentor-analytics", role: "mentor" },
        JWT_SECRET
    );

    const studentToken = jwt.sign(
        { userId: "student-analytics", role: "student" },
        JWT_SECRET
    );

    it("should allow mentor to view student progress", async () => {
        // student completes chapters
        await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        await request(app)
            .post("/api/progress/2/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        const res = await request(app)
            .get("/api/mentor/progress")
            .set("Authorization", `Bearer ${mentorToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    studentId: "student-analytics",
                    completedChapters: 2,
                    percentage: 40
                })
            ])
        );
    });

    it("should block student from accessing mentor analytics", async () => {
        const res = await request(app)
            .get("/api/mentor/progress")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
    });
});
