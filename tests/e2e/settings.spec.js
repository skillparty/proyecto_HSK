const { test, expect } = require("@playwright/test");
const { gotoApp } = require("./helpers");

test("settings: las preferencias sobreviven al reload", async ({ page }) => {
  await gotoApp(page);

  const before = await page.evaluate(() => ({
    audio: window.app.isAudioEnabled,
    voice: window.app.selectedVoice,
    lang: window.app.currentLanguage,
    order: window.app.practiceOrderMode,
    tone: window.app.toneCheckMode,
  }));
  console.log("INICIAL:", JSON.stringify(before));

  // Se disparan los eventos reales sobre los controles. El dropdown de settings
  // se cierra solo al primer click, y su visibilidad no es lo que se audita acá:
  // lo que importa es la cadena listener -> estado -> localStorage -> restore.
  await page.evaluate(() => {
    const change = (id, value) => {
      const el = document.getElementById(id);
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    document.getElementById("audio-toggle").click();
    change("voice-select", "male");
    change("language-select", "en");
    change("practice-order-mode", "srs");
    change("tone-check-select", "strict");
  });
  await page.waitForTimeout(800);

  const stored = await page.evaluate(() => ({
    audio: localStorage.getItem("hsk-audio-enabled"),
    voice: localStorage.getItem("hsk-voice-preference"),
    lang: localStorage.getItem("hsk-language"),
    order: localStorage.getItem("hsk-practice-order-mode"),
    tone: localStorage.getItem("hsk-tone-check-mode"),
  }));
  console.log("EN STORAGE:", JSON.stringify(stored));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.app && window.app.uiController);
  await page.waitForTimeout(1500);

  const after = await page.evaluate(() => ({
    audio: window.app.isAudioEnabled,
    voice: window.app.selectedVoice,
    lang: window.app.currentLanguage,
    order: window.app.practiceOrderMode,
    tone: window.app.toneCheckMode,
    voiceSel: document.getElementById("voice-select")?.value,
    langSel: document.getElementById("language-select")?.value,
    orderSel: document.getElementById("practice-order-mode")?.value,
    toneSel: document.getElementById("tone-check-select")?.value,
  }));
  console.log("TRAS RELOAD:", JSON.stringify(after));

  expect(after.voice).toBe("male");
  expect(after.lang).toBe("en");
  expect(after.order).toBe("srs");
  expect(after.tone).toBe("strict");
  expect(after.audio).toBe(!before.audio);
});
