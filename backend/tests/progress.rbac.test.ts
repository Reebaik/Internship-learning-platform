import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Progress RBAC - Student only", () => {
    it("should allow student to complete a chapter", async () => {
        const studentToken = jwt.sign(
            { userId: "student-2", role: "student" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Chapter completed");
    });

    it("should block mentor from completing a chapter", async () => {
        const mentorToken = jwt.sign(
            { userId: "mentor-1", role: "mentor" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${mentorToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Forbidden");
    });

    it("should block admin from completing a chapter", async () => {
        const adminToken = jwt.sign(
            { userId: "admin-1", role: "admin" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Forbidden");
    });
});
