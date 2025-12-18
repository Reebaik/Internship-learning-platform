import request from "supertest";
import app from "../src/app";

describe("Express app setup", () => {
    it("GET /health should return 200", async () => {
        const res = await request(app).get("/health");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});
