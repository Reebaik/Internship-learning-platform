import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("RBAC - Role Based Access Control", () => {
    it("should return 403 when student accesses mentor-only route", async () => {
        const studentToken = jwt.sign(
            { userId: "student-1", role: "student" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
    });

    it("should allow mentor to access mentor-only route", async () => {
        const mentorToken = jwt.sign(
            { userId: "mentor-1", role: "mentor" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${mentorToken}`);

        expect(res.status).toBe(200);
    });

    it("should allow admin to access mentor-only route", async () => {
        const adminToken = jwt.sign(
            { userId: "admin-1", role: "admin" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Course created");
    });
});
