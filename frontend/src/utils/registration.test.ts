import { describe, expect, it } from "vitest";
import { createIdempotencyKey, EXAM_CATEGORIES } from "./registration";

describe("registration form helpers", () => {
  it("includes every exam category offered by the registration form", () => {
    expect(EXAM_CATEGORIES).toEqual([
      "SSC", "Railway", "Banking", "Bihar government exams", "UPSC", "Other",
    ]);
  });

  it("creates a unique UUID idempotency key per submission", () => {
    const first = createIdempotencyKey();
    const second = createIdempotencyKey();
    expect(first).toMatch(/^[0-9a-f-]{36}$/i);
    expect(first).not.toBe(second);
  });
});
