import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "../../public/projects/estate-ai");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  colorScheme: "light",
  deviceScaleFactor: 1,
  viewport: { width: 1440, height: 1000 },
});

await page.goto("http://127.0.0.1:3002", { waitUntil: "networkidle" });
await page.locator(".map-marker").first().waitFor();
await page.screenshot({ path: resolve(outputDirectory, "discovery.png"), fullPage: true });

await page.goto("http://127.0.0.1:3002/properties/juniper-row-duplex", {
  waitUntil: "networkidle",
});
await page.getByRole("heading", { level: 1, name: "Juniper Row Duplex" }).waitFor();
await page.screenshot({ path: resolve(outputDirectory, "property-analysis.png") });

await page.getByRole("heading", { level: 2, name: "Scenario comparison" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: resolve(outputDirectory, "scenario-analysis.png") });

await page.goto("http://127.0.0.1:3002/compare", { waitUntil: "networkidle" });
await page.locator(".compare-column").first().waitFor();
await page.screenshot({ path: resolve(outputDirectory, "comparison.png"), fullPage: true });

await browser.close();
