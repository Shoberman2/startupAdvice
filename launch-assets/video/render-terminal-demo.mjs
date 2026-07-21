import { execFileSync } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUTPUT_DIR = join(ROOT, "public", "launch");
const RECORDING_DIR = join(HERE, ".recording");
const HTML = join(HERE, "terminal-demo.html");
const WEBM = join(HERE, "founder-panel-terminal-demo.webm");
const MP4 = join(OUTPUT_DIR, "founder-panel-terminal-demo.mp4");
const POSTER = join(OUTPUT_DIR, "founder-panel-terminal-demo-poster.png");

await mkdir(OUTPUT_DIR, { recursive: true });
await rm(RECORDING_DIR, { recursive: true, force: true });
await mkdir(RECORDING_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: RECORDING_DIR,
    size: { width: 1920, height: 1080 },
  },
});
const page = await context.newPage();
await page.goto(pathToFileURL(HTML).href, { waitUntil: "load" });
await page.waitForTimeout(24_000);
const video = page.video();
await context.close();
await browser.close();

if (!video) throw new Error("Playwright did not create a recording");
await rename(await video.path(), WEBM);
await rm(RECORDING_DIR, { recursive: true, force: true });

execFileSync("ffmpeg", [
  "-loglevel", "error", "-y", "-i", WEBM,
  "-vf", "fps=30,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18",
  "-movflags", "+faststart", "-an", MP4,
], { stdio: "inherit" });
execFileSync("ffmpeg", [
  "-loglevel", "error", "-y", "-ss", "00:00:17.000", "-i", MP4,
  "-frames:v", "1", "-update", "1", POSTER,
], { stdio: "inherit" });

await rm(WEBM, { force: true });
console.log(JSON.stringify({ video: MP4, poster: POSTER }));
