import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { resumableCredentials } from "../src/client/useRoom";

const saved = { room: "AAAAAAAA", player: "p1", token: "t".repeat(64) };
beforeEach(() => {
  const store = new Map<string, string>([
    ["pact.session", JSON.stringify(saved)],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

it("resumes the saved pact when the page has no invite link", () => {
  expect(resumableCredentials("")).toEqual(saved);
});

it("resumes the saved pact from its own invite link", () => {
  expect(resumableCredentials("?room=AAAAAAAA")).toEqual(saved);
  expect(resumableCredentials("?room=aaaaaaaa")).toEqual(saved);
});

it("lets a friend's invite link win over a pact made earlier", () => {
  expect(resumableCredentials("?room=BBBBBBBB")).toBeNull();
});
