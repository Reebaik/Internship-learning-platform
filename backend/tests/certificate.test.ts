import request from "supertest";
import app from "../src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

describe("Certificate eligibility", () => {
    const studentToken = jwt.sign(
        { userId: "student-cert", role: "student" },
        JWT_SECRET
    );

    it("should deny certificate if course is not fully completed", async () => {
        // complete only 2 out of 5 chapters
        await request(app)
            .post("/api/progress/1/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        await request(app)
            .post("/api/progress/2/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        const res = await request(app)
            .get("/api/certificates/course-1")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Course not completed");
    });

    it("should allow certificate download after 100% completion", async () => {
        // complete remaining chapters
        await request(app)
            .post("/api/progress/3/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        await request(app)
            .post("/api/progress/4/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        await request(app)
            .post("/api/progress/5/complete")
            .set("Authorization", `Bearer ${studentToken}`);

        const res = await request(app)
            .get("/api/certificates/course-1")
            .set("Authorization", `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Certificate generated");
    });
});
