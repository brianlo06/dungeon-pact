import { it, expect } from "vitest";
import { simulate } from "../scripts/simulate";
it("completes deterministic runs across party sizes and seeds", () => {
  for (const count of [2, 3, 4])
    for (let i = 0; i < 10; i++) {
      const a = simulate(`regression-${i}`, count);
      expect(a.phase).toBe("COMPLETE");
      expect(a).toEqual(simulate(`regression-${i}`, count));
      expect(a.gold).toBeGreaterThanOrEqual(0);
    }
});
