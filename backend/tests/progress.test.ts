import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Progress - Prevent duplicate chapter completion", () => {
    const studentToken = jwt.sign(
        { userId: "student-duplicate", role: "student" },
        JWT_SECRET
    );

    it("should block completing the same chapter twice", async () => {
        // First completion → should succeed
        const first = await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(first.status).toBe(200);

        // Second completion → should fail
        const second = await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(second.status).toBe(403);
        expect(second.body.message).toBe("Chapter already completed");
    });
});
