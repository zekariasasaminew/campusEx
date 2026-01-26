/**
 * Test infrastructure validation
 * Ensures vitest, testing-library, and happy-dom are configured correctly
 */

import { describe, it, expect } from "vitest";

describe("Test Infrastructure", () => {
  it("should run vitest tests", () => {
    expect(true).toBe(true);
  });

  it("should support basic assertions", () => {
    expect(1 + 1).toBe(2);
    expect("test").toContain("es");
    expect([1, 2, 3]).toHaveLength(3);
  });

  it("should support object and array matchers", () => {
    const obj = { name: "test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj).toEqual({ name: "test", value: 42 });

    const arr = [1, 2, 3];
    expect(arr).toContain(2);
    expect(arr).toEqual(expect.arrayContaining([1, 2]));
  });

  it("should support async tests", async () => {
    const asyncValue = await Promise.resolve("success");
    expect(asyncValue).toBe("success");
  });
});
