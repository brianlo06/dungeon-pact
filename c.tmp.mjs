import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const B = "http://127.0.0.1:5399/dev/bosses.html?viewport=fit&party=4&motion=1";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(`${B}&stage=objective`);
await p.locator(".battle").waitFor();
await p.addStyleTag({ content: ".preview-toolbar{display:none!important}" });
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/col-1.png` });
// Silhouette test: fill the whole figure flat black and see if it still reads.
await p.addStyleTag({ content: `.collector * { fill: #000 !important; stroke: #000 !important; }
  .collector { filter: none !important; }
  .stage .layer-far, .stage .layer-mid, .stage .layer-ground, .stage .layer-foreground { opacity: 0.08 !important; }` });
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/col-silhouette.png` });
await b.close();
