import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Progress - Sequential Chapter Completion", () => {
    const studentToken = jwt.sign(
        { userId: "student-1", role: "student" },
        JWT_SECRET
    );

    it("should block completing chapter 2 before chapter 1", async () => {
        const res = await request(app)
            .post("/api/progress/2/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Complete previous chapters first");
    });
});
