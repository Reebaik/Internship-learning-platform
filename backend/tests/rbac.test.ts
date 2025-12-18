import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("RBAC - Role Based Access Control", () => {
    it("should return 403 when student accesses mentor-only route", async () => {
        // create a STUDENT token
        const studentToken = jwt.sign(
            { userId: "student-1", role: "student" },
            JWT_SECRET
        );

        const res = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Forbidden");
    });
});
