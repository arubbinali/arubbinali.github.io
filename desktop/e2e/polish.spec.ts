import { expect, test } from "@playwright/test";

test("theme, sidebar, statistics, settings controls, and send hit area", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("doaor-experience", JSON.stringify({ intro: false, atmosphere: true, compact: false })));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Say it. It gets done." })).toBeVisible();

  const shell = page.locator(".app-shell");
  const sidebar = page.locator(".sidebar");
  const fullWidth = (await sidebar.boundingBox())!.width;
  await expect(shell).toHaveCSS("transition-duration", /0\.42s/);
  await page.getByRole("button", { name: "Compact navigation" }).click();
  expect(fullWidth).toBeGreaterThan(200);
  await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(66, 0);
  await expect(page.locator(".brand-initial")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/rail-collapsed.png" });
  await page.getByRole("button", { name: "Expand navigation" }).click();
  await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeGreaterThan(200);

  const theme = page.getByRole("switch", { name: "Switch gradient theme" });
  await expect(theme).toHaveAttribute("aria-checked", "false");
  await theme.click();
  await expect(shell).toHaveAttribute("data-wave-theme", "noir");
  await theme.click();
  await expect(shell).toHaveAttribute("data-wave-theme", "vivid");
  await expect(page.locator(".workspace-waves canvas")).toHaveCount(1);

  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Stats" }).click();
  await expect.poll(async () => page.locator(".content").evaluate((element) => element.scrollTop)).toBeLessThan(5);
  const periodButton = (await page.getByRole("radio", { name: "365 days" }).boundingBox())!;
  await page.mouse.move(periodButton.x + periodButton.width / 2, periodButton.y + periodButton.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => page.locator(".contribution-grid span").count()).toBeGreaterThan(360);
  expect(await page.locator(".content").evaluate((element) => element.scrollTop)).toBeLessThan(5);
  const grid = (await page.locator(".contribution-grid").boundingBox())!;
  const card = (await page.locator(".contribution-card").boundingBox())!;
  expect(grid.width).toBeGreaterThan(card.width * 0.8);
  await page.screenshot({ path: "test-results/stats-year.png" });
  await page.getByRole("radio", { name: "Week" }).click();
  await expect(page.locator(".contribution-grid span")).toHaveCount(7);
  await page.getByRole("radio", { name: "Year" }).click();
  await expect(page.getByRole("combobox", { name: "Statistics year" })).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("combobox", { name: "Interface scale" }).click();
  await expect(page.getByRole("listbox", { name: "Interface scale" })).toBeVisible();
  await page.getByRole("option", { name: "200%" }).click();
  await expect(page.getByRole("combobox", { name: "Interface scale" })).toContainText("200%");
  await page.getByRole("combobox", { name: "Interface scale" }).click();
  await page.getByRole("option", { name: "125%" }).click();
  await page.getByRole("combobox", { name: "External shell" }).click();
  await expect(page.getByRole("listbox", { name: "External shell" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox", { name: "External shell" })).toBeHidden();

  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Home" }).click();
  await page.getByRole("textbox", { name: "Ask doaorel" }).fill("Open Notepad");
  const button = page.getByRole("button", { name: "Plan request" });
  const bounds = (await button.boundingBox())!;
  expect(bounds.width).toBeGreaterThan(42.5);
  expect(bounds.height).toBeGreaterThan(42.5);
  expect(await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest(".assistant-send")), { x: bounds.x + 5, y: bounds.y + 5 })).toBe(true);
  expect(errors).toEqual([]);
});
