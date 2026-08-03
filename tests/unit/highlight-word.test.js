import { describe, expect, test } from "vitest";

import "../../assets/js/modules/practice-view-controller.js";

// El controller solo necesita `app` para otras cosas; highlightWordInSentence
// es lógica pura sobre strings.
const controller = new window.PracticeViewController({});
const highlight = (sentence, character) =>
  controller.highlightWordInSentence(sentence, character);

const WRAP = (text) => `<span class="highlight-char">${text}</span>`;

describe("highlightWordInSentence — palabras normales", () => {
  test("marca la palabra dentro de la frase", () => {
    expect(highlight("我可以爱。", "爱")).toBe(`我可以${WRAP("爱")}。`);
  });

  test("marca todas las apariciones", () => {
    expect(highlight("爱是爱。", "爱")).toBe(`${WRAP("爱")}是${WRAP("爱")}。`);
  });

  test("devuelve la frase intacta si la palabra no aparece", () => {
    expect(highlight("我可以爱。", "狗")).toBe("我可以爱。");
  });

  test("tolera frase o palabra vacías", () => {
    expect(highlight("", "爱")).toBe("");
    expect(highlight("我可以爱。", "")).toBe("我可以爱。");
  });
});

describe("highlightWordInSentence — patrones correlativos", () => {
  test("marca las dos partes por separado", () => {
    expect(highlight("这本书虽然很厚，但是不贵。", "虽然......但是......")).toBe(
      `这本书${WRAP("虽然")}很厚，${WRAP("但是")}不贵。`,
    );
  });

  test("marca solo la aparición que forma el patrón, no las repeticiones", () => {
    // El segundo 才 no forma parte del patrón y no debe marcarse.
    expect(highlight("只有你才做得到，才行。", "只有......才......")).toBe(
      `${WRAP("只有")}你${WRAP("才")}做得到，才行。`,
    );
  });

  test("exige que las partes aparezcan en orden", () => {
    const sentence = "但是他虽然来了。";
    expect(highlight(sentence, "虽然......但是......")).toBe(sentence);
  });

  test("si falta una parte deja la frase intacta", () => {
    const sentence = "这本书虽然很厚。";
    expect(highlight(sentence, "虽然......但是......")).toBe(sentence);
  });

  // Los puntos del patrón son comodines en una expresión regular: sin escapar,
  // 虽然......但是 marcaría cualquier cosa entre medio.
  test("no interpreta los puntos del patrón como comodines", () => {
    const sentence = "虽然ABCDEF但是。";
    expect(highlight(sentence, "虽然......但是......")).toBe(
      `${WRAP("虽然")}ABCDEF${WRAP("但是")}。`,
    );
  });
});
