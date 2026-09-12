import { expect, it, vi } from "vitest";
import { ScorePlayer } from "../src/client/audio/score";

it("music has one scheduler, releases voices, stops hidden/muted, and resumes without a backlog", () => {
  vi.useFakeTimers();
  const param = () => ({
    value: 0,
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const oscillators: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  const ctx = {
    currentTime: 0,
    destination: {},
    createGain: () => {
      const node = {
        gain: param(),
        connect: (_: unknown) => node,
        disconnect: vi.fn(),
      };
      return node;
    },
    createOscillator: () => {
      const node = {
        frequency: param(),
        type: "sine",
        connect: (target: unknown) => target,
        disconnect: vi.fn(),
        onended: () => {},
        start: vi.fn(),
        stop: vi.fn(),
      };
      node.stop.mockImplementation(() => node.onended());
      oscillators.push(node);
      return node;
    },
  };
  try {
    const score = new ScorePlayer(ctx as unknown as AudioContext);
    score.set("battle", 0.2, true);
    expect(vi.getTimerCount()).toBe(1);
    const initial = oscillators.length;
    score.set("battle", 0.1, true);
    expect(oscillators.length).toBe(initial);
    expect(vi.getTimerCount()).toBe(1);
    score.set("battle", 0, false);
    expect(vi.getTimerCount()).toBe(0);
    expect(oscillators.every((o) => o.stop.mock.calls.length > 0)).toBe(true);
    ctx.currentTime = 600;
    score.set("cistern", 0.2, true);
    expect(oscillators.length - initial).toBeLessThan(5);
    expect(oscillators.at(-1)!.start.mock.calls[0][0]).toBeGreaterThanOrEqual(
      600,
    );
    score.set("archive", 0.2, true);
    expect(vi.getTimerCount()).toBe(1);
    score.set("archive", 0, false);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
