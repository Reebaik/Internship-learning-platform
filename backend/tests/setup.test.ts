import { resetProgressTable } from "./testDb";

beforeEach(async () => {
    await resetProgressTable();
});

describe("Test setup", () => {
    it("should run test setup", () => {
        expect(true).toBe(true);
    });
});
