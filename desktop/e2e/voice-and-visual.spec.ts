import { test, expect } from "@playwright/test";
test("microphone denial is actionable and recording really produces audio", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("doaor-experience", JSON.stringify({intro:false, atmosphere:true, compact:false}));
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable:true, value: async () => { throw new DOMException("Denied","NotAllowedError"); } });
  });
  await page.goto("/");
  await page.getByRole("button",{name:"Start listening"}).click();
  await expect(page.getByText("Microphone permission was denied.",{exact:false})).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(window,"SpeechRecognition",{value:undefined,configurable:true});
    Object.defineProperty(window,"webkitSpeechRecognition",{value:undefined,configurable:true});
    Object.defineProperty(navigator.mediaDevices,"getUserMedia",{configurable:true,value:async () => {
      const context=new AudioContext();
      const destination=context.createMediaStreamDestination();
      const oscillator=context.createOscillator(); oscillator.connect(destination); oscillator.start();
      destination.stream.getTracks().forEach(track=>{ const stop=track.stop.bind(track); track.stop=()=>{stop(); oscillator.stop(); void context.close();}; });
      return destination.stream;
    }});
  });
  await page.getByRole("button",{name:"Start listening"}).click();
  await expect(page.getByText("Recording ·",{exact:false})).toBeVisible();
  await page.waitForTimeout(500);
  await page.getByRole("button",{name:"Stop listening"}).click();
  await expect(page.locator("audio")).toHaveAttribute("src",/^blob:/);
  await expect(page.getByRole("button",{name:"Start listening"})).toBeEnabled();
});
test("intro fills top edge and hides chrome, then every page is inspectable", async ({ page }) => {
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".startup")).toBeVisible();
  await expect(page.locator(".app-shell > .window-bar")).toBeHidden();
  const rect=await page.locator(".startup").boundingBox();
  expect(rect?.y).toBe(0);
  await page.screenshot({path:"test-results/intro.png"});
  await expect(page.locator(".startup")).toHaveCount(0);
  await expect(page.locator(".app-shell > .window-bar")).toBeVisible();
  await expect(page.locator(".workspace-waves canvas")).toHaveCount(1);
  await page.waitForTimeout(500);
  await page.screenshot({path:"test-results/home.png"});
  const nav=page.getByRole("navigation",{name:"Main navigation"});
  for(const name of ["Workspace","Tools","Stats","Activity"]) {
    await nav.getByRole("button",{name,exact:true}).click();
    await page.waitForTimeout(350);
    await page.screenshot({path:`test-results/${name.toLowerCase()}.png`});
  }
  for(const name of ["Settings","Profile"]) {
    await page.getByRole("button",{name,exact:true}).click();
    await page.waitForTimeout(350);
    await page.screenshot({path:`test-results/${name.toLowerCase()}.png`});
  }
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("o");
  await page.waitForTimeout(350);
  await page.screenshot({path:"test-results/search.png"});
  expect(errors).toEqual([]);
});
