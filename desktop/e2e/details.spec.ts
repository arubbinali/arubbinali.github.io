import { test, expect } from "@playwright/test";
test("copy formats, reject missing date, and dismiss menus outside", async ({page, context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => localStorage.setItem("doaor-experience",JSON.stringify({intro:false,atmosphere:true,compact:false})));
  await page.goto("/");
  await page.getByRole("navigation",{name:"Main navigation"}).getByRole("button",{name:"Tools",exact:true}).click();
  for(const name of ["Short time","Long time","Short date","Long date","Date & time","Full date & time","Relative time"]) {
    const button=page.getByRole("button",{name:`Copy ${name}`,exact:true});
    const syntax=await button.locator("..").locator("code").textContent();
    await button.click();
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(syntax);
  }
  await page.getByLabel("Date & time",{exact:true}).fill("");
  await expect(page.getByRole("alert")).toContainText("Choose a valid date");
  await page.getByRole("button",{name:"Now",exact:true}).click();
  await expect(page.locator(".timestamp-row")).toHaveCount(7);
  await page.getByRole("button",{name:"File",exact:true}).hover();
  await page.getByRole("heading",{name:"Tools",exact:true}).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("button",{name:"File",exact:true}).click();
  await page.getByRole("menuitem",{name:"Exit",exact:true}).click();
  const modal=page.getByRole("dialog",{name:"Exit Doaorel?"});
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
});
