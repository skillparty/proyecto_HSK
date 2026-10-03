import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import "../../assets/js/matrix-game-view.js";

describe("MatrixGameView - Batch DocumentFragment Rendering & Feedback", () => {
  let mockGame;
  let view;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="character-matrix"></div>
      <div id="feedback-overlay"></div>
    `;

    mockGame = {
      difficulty: "normal",
      config: {
        easy: { gridSize: 4 },
        normal: { gridSize: 6 },
        hard: { gridSize: 6 },
      },
      matrixCharacters: ["你", "好", "学", "生", "中", "国"],
      logDebug: vi.fn(),
      logWarn: vi.fn(),
      logError: vi.fn(),
    };

    view = new window.MatrixGameView(mockGame);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders matrix characters cleanly using batch DocumentFragment insertion", () => {
    view.renderMatrix();

    const container = document.getElementById("character-matrix");
    expect(container).not.toBeNull();
    expect(container.style.gridTemplateColumns).toBe("repeat(6, 1fr)");
    expect(container.style.gridTemplateRows).toBe("repeat(6, 1fr)");

    const buttons = container.querySelectorAll(".matrix-char");
    expect(buttons.length).toBe(6);
    expect(buttons[0].textContent).toBe("你");
    expect(buttons[1].textContent).toBe("好");
    expect(buttons[0].dataset.index).toBe("0");
    expect(buttons[1].dataset.index).toBe("1");
    // Verify staggered entrance animation delay was applied
    expect(buttons[0].style.animationDelay).toBe("0s");
    expect(buttons[1].style.animationDelay).toBe("0.015s");
  });

  it("handles missing matrix container gracefully without throwing", () => {
    document.getElementById("character-matrix").remove();
    expect(() => view.renderMatrix()).not.toThrow();
  });

  it("shows feedback with specified type and message then hides after timeout", () => {
    vi.useFakeTimers();
    view.showFeedback("correct", "🔥 COMBO x2! +30");

    const overlay = document.getElementById("feedback-overlay");
    expect(overlay.className).toContain("feedback-overlay correct");
    expect(overlay.textContent).toBe("🔥 COMBO x2! +30");
    expect(overlay.style.display).toBe("flex");

    vi.advanceTimersByTime(850);
    expect(overlay.style.display).toBe("none");
    vi.useRealTimers();
  });
});
