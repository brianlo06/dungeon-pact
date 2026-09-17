import { chromium } from "@playwright/test";

/**
 * Frame times while an Ultimate plays, against the round replay that follows
 * it on the same page. Headless numbers from one machine: read them as a
 * comparison between the two, not as a promise about anyone's GPU.
 *
 *   npx tsx scripts/profile-ultimate.ts <port> [WxH] [lab query]
 */
const [port, size = "1920x1080", extra = "", css = ""] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
// GPU=1 runs full Chromium headless on the machine's own GPU (Metal on a
// Mac). The default headless shell rasterizes in software, which overstates
// the cost of anything large or filtered many times over.
const browser = await chromium.launch(
  process.env.GPU
    ? { channel: "chromium", args: ["--use-angle=metal", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] }
    : {},
);
const page = await browser.newPage({ viewport: { width: width + 40, height: height + 260 } });
await page.addInitScript(`(() => {
  const w = window;
  w.prof = { film: [], round: [], nodes: 0, svg: 0, filters: 0, vfx: 0, long: [] };
  let last = performance.now();
  let seenFilm = false;
  const tick = (now) => {
    const d = now - last; last = now;
    const film = document.querySelector(".ult-cinematic");
    if (film) {
      seenFilm = true;
      w.prof.film.push(d);
      // Counted on a handful of frames only: counting is not free, and the
      // profiler must not be what it measures.
      if (w.prof.film.length % 40 !== 20) { requestAnimationFrame(tick); return; }
      const n = film.querySelectorAll("*").length;
      if (n > w.prof.nodes) {
        w.prof.nodes = n;
        w.prof.svg = film.querySelectorAll("svg *").length;
        w.prof.vfx = film.querySelectorAll(".cine-vfx").length;
      }
      let f = 0;
      for (const el of film.querySelectorAll(".cine-look, .cine-film, .cine-vfx *")) {
        const s = getComputedStyle(el).filter;
        if (s && s !== "none") f++;
      }
      w.prof.filters = Math.max(w.prof.filters, f);
    } else if (seenFilm && document.querySelector(".stage.is-replaying")) w.prof.round.push(d);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.prof.long.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: true });
  } catch {}
})()`);
await page.goto(`http://127.0.0.1:${port}/dev/ultimates.html?auto=1&viewport=${size}&${extra}`);
// An experiment: a stylesheet that switches one cost off, to find the costs.
if (css) await page.addStyleTag({ content: css });
await page.locator(".ult-cinematic").waitFor({ timeout: 30000 });
await page.locator(".ult-cinematic").waitFor({ state: "detached", timeout: 30000 });
await page.locator(".stage.is-replaying").waitFor({ state: "detached", timeout: 30000 });
interface Profile {
  film: number[];
  round: number[];
  nodes: number;
  svg: number;
  filters: number;
  vfx: number;
  long: number[];
}
const prof = (await page.evaluate("window.prof")) as Profile;
const stats = (xs: number[]) => {
  // The skipped measurement-start frame and anything after a long stall.
  const s = [...xs].slice(1).sort((a, b) => a - b);
  // A boss intro has no round after it.
  if (!s.length) return null;
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return {
    frames: s.length,
    p50: +q(0.5).toFixed(1),
    p95: +q(0.95).toFixed(1),
    max: +s[s.length - 1].toFixed(1),
    over20ms: s.filter((d) => d > 20).length,
    over34ms: s.filter((d) => d > 34).length,
  };
};
console.log(
  JSON.stringify(
    {
      size,
      extra,
      css,
      film: stats(prof.film),
      roundAfter: stats(prof.round),
      filmPeakNodes: prof.nodes,
      filmPeakSvgNodes: prof.svg,
      filmPeakVfx: prof.vfx,
      filmPeakFilteredElements: prof.filters,
      longTasks: prof.long,
    },
    null,
    1,
  ),
);
await browser.close();
