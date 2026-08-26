import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("discovery renders six synthetic properties and map markers", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Compare assumptions, not listing hype.",
  );
  await expect(page.locator(".property-card")).toHaveCount(6);
  await expect(page.locator(".map-marker")).toHaveCount(6);
  await expect(page.getByText("Every property, address, neighborhood, comparable, and metric is synthetic.")).toBeVisible();
});

test("discovery filters synthetic cities", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("City").selectOption("Cedar Vale");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/city=Cedar/);
  await expect(page.locator(".property-card")).toHaveCount(2);
  await expect(page.locator(".map-marker")).toHaveCount(2);
});

test("property detail exposes deterministic analysis and structured brief", async ({ page }) => {
  await page.goto("/properties/juniper-row-duplex", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Juniper Row Duplex");
  await expect(page.getByText("Deterministic outputs", { exact: true })).toBeVisible();
  await expect(page.getByRole("row", { name: /Conservative/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Base/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Optimistic/ })).toBeVisible();
  await expect(page.getByText("This demo brief explains only the supplied synthetic data")).toBeVisible();
  await expect(page.getByText("Synthetic comparable 1", { exact: true })).toBeVisible();
});

test("calculator recomputes changed assumptions through the API", async ({ page }) => {
  await page.goto("/properties/juniper-row-duplex");
  const original = await page.locator(".analysis-output .metric-small").filter({ hasText: "Monthly cash flow" }).locator("strong").textContent();
  await page.getByLabel("Monthly rent").fill("5200");
  await page.getByRole("button", { name: "Recalculate deterministically" }).click();

  await expect(page.locator(".analysis-output .metric-small").filter({ hasText: "Monthly cash flow" }).locator("strong")).not.toHaveText(original ?? "");
});

test("custom scenario can be created and compared", async ({ page }) => {
  await page.goto("/properties/juniper-row-duplex");
  const scenarioName = `Playwright review ${Date.now()}`;
  await page.getByLabel("Scenario name").fill(scenarioName);
  await page.getByLabel("Rent change %").fill("4");
  await page.getByRole("button", { name: "Create custom scenario" }).click();

  await expect(page.getByRole("status")).toHaveText("Scenario created and calculated.");
  await expect(page.getByRole("row", { name: new RegExp(scenarioName) })).toBeVisible();
});

test("saved selections update from the property interface", async ({ page }) => {
  await page.goto("/properties/foundry-loft");
  const saveToggle = page.getByRole("button", { name: /^(Save property|Saved ✓)$/ });
  await expect(saveToggle).toBeVisible();
  if ((await saveToggle.textContent()) === "Saved ✓") {
    await saveToggle.click();
    await expect(saveToggle).toHaveText("Save property");
  }
  await saveToggle.click();
  await expect(saveToggle).toHaveText("Saved ✓");
  await page.goto("/saved");
  await expect(page.getByRole("heading", { name: "Foundry Loft" })).toBeVisible();
});

test("comparison shows three properties with consistent metrics", async ({ page }) => {
  await page.goto("/compare");

  await expect(page.locator(".compare-column")).toHaveCount(3);
  await expect(page.getByText("Cap rate", { exact: true })).toHaveCount(3);
  await expect(page.getByText("Break-even occupancy", { exact: true })).toHaveCount(3);
});

for (const width of [375, 768, 1440] as const) {
  test(`discovery fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

for (const route of ["/", "/properties/juniper-row-duplex", "/compare", "/saved", "/methodology"] as const) {
  test(`${route} has no serious or critical Axe violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(serious).toEqual([]);
  });
}
