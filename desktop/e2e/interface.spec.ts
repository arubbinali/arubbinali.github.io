import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("doaor-experience", JSON.stringify({ intro: false, atmosphere: true, compact: false })));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Say it. It gets done." })).toBeVisible();
});
test("search expands, clears, navigates, closes, and reopens", async ({ page }) => {
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search Doaorel" });
  const input = page.getByRole("combobox", { name: "Search Doaorel" });
  await expect(input).toBeFocused();
  await expect(page.getByRole("listbox")).toBeHidden();
  const idle = (await dialog.boundingBox())!;
  await input.fill("s");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.waitForTimeout(350);
  expect((await dialog.boundingBox())!.width).toBeGreaterThan(idle.width);
  await input.fill("open settings");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await page.keyboard.press("Control+k");
  await input.fill("discord");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await page.waitForTimeout(350);
  await expect.poll(async () => Math.abs((await dialog.boundingBox())!.width - idle.width)).toBeLessThan(1);
  await input.fill("tool");
  await input.press("Backspace");
  await input.fill("");
  await expect(page.getByRole("listbox")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.keyboard.press("Control+k");
  await expect(input).toHaveValue("");
});
test("menus never overlap, dialogs cancel, rail remains useful", async ({ page }) => {
  for (const name of ["File", "View", "Help", "File"]) {
    await page.getByRole("button", { name, exact: true }).hover();
    await expect(page.getByRole("menu")).toHaveCount(1);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await page.getByRole("menuitem", { name: "About Doaorel" }).click();
  await expect(page.getByRole("dialog", { name: "About Doaorel" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.keyboard.press("Control+b");
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Tools", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Discord timestamps" })).toBeVisible();
});
test("timestamp, account, and every main destination", async ({ page }) => {
  const nav=page.getByRole("navigation", {name:"Main navigation"});
  for (const name of ["Home","Workspace","Tools","Stats","Activity"]) { await nav.getByRole("button",{name,exact:true}).click(); await expect(page.locator("main")).toBeVisible(); }
  await nav.getByRole("button",{name:"Tools",exact:true}).click();
  await page.getByLabel("Date & time", {exact:true}).fill("2026-09-24T12:30");
  await page.getByLabel("Input timezone").selectOption("utc");
  await expect(page.locator(".timestamp-row")).toHaveCount(7);
  await page.getByRole("button",{name:"Profile",exact:true}).click();
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page.getByText("Account services aren't connected", {exact:false})).toBeVisible();
  await page.getByRole("button",{name:"Settings",exact:true}).click();
  await expect(page.locator(".theme-options")).toHaveCount(0);
});
test("search stays centered and inside every window size", async ({ page }) => {
  for(const [width,height] of [[880,620],[1280,820],[1920,1080],[2560,1100]]) {
    await page.setViewportSize({width,height});
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("o");
    await page.waitForTimeout(350);
    const box=(await page.getByRole("dialog").boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x+box.width).toBeLessThanOrEqual(width);
    expect(Math.abs(box.x+box.width/2-width/2)).toBeLessThan(2);
    expect(box.y+box.height).toBeLessThanOrEqual(height);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  }
});
