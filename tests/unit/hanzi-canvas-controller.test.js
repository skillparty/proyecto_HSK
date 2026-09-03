import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/hanzi-canvas-controller.js";

const stubApp = () => ({
  audioController: {
    playAudio: vi.fn(),
  },
  logDebug: vi.fn(),
  logWarn: vi.fn(),
});

describe("HanziCanvasController", () => {
  let app;
  let controller;
  let canvas;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="strokes-radicals-canvas-section">
        <strong id="hanzi-canvas-char-display">中</strong>
        <canvas id="hanzi-draw-canvas" width="320" height="320"></canvas>
        <input type="text" id="hanzi-canvas-char-input" value="中" />
        <button id="hanzi-canvas-clear-btn"></button>
        <button id="hanzi-canvas-undo-btn"></button>
        <button id="hanzi-canvas-ghost-toggle"></button>
        <button id="hanzi-canvas-audio-btn"></button>
        <button id="hanzi-canvas-animate-btn"></button>
        <button class="hz-color-chip active" data-color="#e11d48"></button>
        <button class="hz-quick-char">好</button>
      </div>
    `;

    canvas = document.getElementById("hanzi-draw-canvas");
    // Mock canvas context methods
    canvas.getContext = vi.fn().mockReturnValue({
      scale: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      setLineDash: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
    });

    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 10,
      top: 20,
      width: 320,
      height: 320,
    });
    canvas.setPointerCapture = vi.fn();

    app = stubApp();
    controller = new window.HanziCanvasController(app);
  });

  test("initializes canvas and sets up DPI scale", () => {
    controller.initialize();
    expect(controller.isInitialized).toBe(true);
    expect(controller.ctx).not.toBeNull();
  });

  test("handlePointerDown, move and up records a stroke", () => {
    controller.initialize();

    controller.handlePointerDown({
      clientX: 50,
      clientY: 60,
      pointerId: 1,
      preventDefault: vi.fn(),
    });

    expect(controller.isDrawing).toBe(true);
    expect(controller.currentStroke.length).toBe(1);

    controller.handlePointerMove({
      clientX: 70,
      clientY: 80,
      preventDefault: vi.fn(),
    });

    expect(controller.currentStroke.length).toBe(2);

    controller.handlePointerUp({
      preventDefault: vi.fn(),
    });

    expect(controller.isDrawing).toBe(false);
    expect(controller.strokes.length).toBe(1);
    expect(controller.strokes[0].points.length).toBe(2);
  });

  test("undo removes the last stroke and redraws", () => {
    controller.initialize();
    controller.strokes = [
      { points: [{ x: 10, y: 10 }], color: "#e11d48", width: 12 },
      { points: [{ x: 20, y: 20 }], color: "#e11d48", width: 12 },
    ];

    controller.undo();
    expect(controller.strokes.length).toBe(1);
  });

  test("clear resets all strokes and in-progress drawing", () => {
    controller.initialize();
    controller.strokes = [{ points: [{ x: 10, y: 10 }] }];
    controller.currentStroke = [{ x: 5, y: 5 }];

    controller.clear();
    expect(controller.strokes.length).toBe(0);
    expect(controller.currentStroke.length).toBe(0);
  });

  test("setCharacter updates character, clears canvas and plays audio", () => {
    controller.initialize();
    controller.setCharacter("好");

    expect(controller.currentChar).toBe("好");
    expect(document.getElementById("hanzi-canvas-char-display").textContent).toBe("好");
    expect(app.audioController.playAudio).toHaveBeenCalledWith("好");
  });

  test("animateStrokes applies visual pulse and plays character audio", () => {
    controller.initialize();
    controller.animateStrokes();

    expect(app.audioController.playAudio).toHaveBeenCalledWith("中");
  });

  test("captures stylus pressure and pointerType from pointer events", () => {
    controller.initialize();
    const mockPenEvent = {
      clientX: 50,
      clientY: 60,
      pressure: 0.85,
      pointerType: "pen",
    };
    const coords = controller.getCanvasCoordinates(mockPenEvent);
    expect(coords.x).toBe(40);
    expect(coords.y).toBe(40);
    expect(coords.pressure).toBe(0.85);
    expect(coords.pointerType).toBe("pen");
  });
});
