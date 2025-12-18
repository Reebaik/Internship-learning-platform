import request from "supertest";
import app from "../src/app";

describe("Authentication - Protected Routes", () => {
    it("should return 401 if no JWT token is provided", async () => {
        const response = await request(app).post("/api/courses");
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 if JWT token is invalid", async () => {
        const response = await request(app)
            .post("/api/courses")
            .set("Authorization", "Bearer invalid.token.value");

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized");
    });
});
