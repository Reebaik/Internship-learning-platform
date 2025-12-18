import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Progress - Percentage calculation", () => {
    const studentToken = jwt.sign(
        { userId: "student-progress", role: "student" },
        JWT_SECRET
    );

    it("should return correct progress percentage", async () => {
        // complete chapter 1
        await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        // complete chapter 2
        await request(app)
            .post("/api/progress/2/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        const res = await request(app)
            .get("/api/progress/my")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.completedChapters).toBe(2);
        expect(res.body.totalChapters).toBe(5);
        expect(res.body.percentage).toBe(40);
    });
});
