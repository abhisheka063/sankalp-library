export const EXAM_CATEGORIES = ["SSC", "Railway", "Banking", "Bihar government exams", "UPSC", "Other"];

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}
