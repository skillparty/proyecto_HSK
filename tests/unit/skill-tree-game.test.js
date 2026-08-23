import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/skill-tree-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playChime: vi.fn(),
  },
  achievementManager: {
    unlock: vi.fn(),
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="skill-tree">
      <div id="tree-zones-container"></div>
      <strong id="tree-total-stars">0</strong>
      <strong id="tree-player-level">Nivel 1</strong>
      <strong id="tree-unlocked-talents">0</strong>

      <div id="tree-talents-list"></div>
      <div id="tree-rank-avatar">🥋</div>
      <h5 id="tree-rank-name">Aprendiz</h5>
      <p id="tree-rank-desc"></p>

      <div id="tree-node-modal" style="display: none;">
        <button id="tree-modal-close-btn">&times;</button>
        <span id="modal-node-icon"></span>
        <h3 id="modal-node-title"></h3>
        <span id="modal-node-zone"></span>

        <div id="modal-challenge-body">
          <div id="modal-step-indicator"></div>
          <p id="modal-question-text"></p>
          <div id="modal-options-grid"></div>
        </div>

        <div id="modal-result-banner" style="display: none;">
          <div id="modal-result-stars"></div>
          <h4 id="modal-result-title"></h4>
          <p id="modal-result-desc"></p>
          <button id="modal-result-continue-btn">Continuar</button>
        </div>
      </div>
    </div>
  `;
};

describe("SkillTreeGame", () => {
  let app;
  let game;

  beforeEach(() => {
    localStorage.clear();
    setupDOM();
    app = stubApp();
    game = new window.SkillTreeGame(app);
  });

  test("initializes correctly and renders zones and nodes", () => {
    game.init();
    expect(document.querySelectorAll(".map-zone").length).toBe(4);
    expect(document.querySelectorAll(".trail-node").length).toBe(15);
    expect(document.querySelector(".trail-node[data-node-id='node-1']").classList.contains("available")).toBe(true);
  });

  test("opens challenge modal for available node", () => {
    game.init();
    const firstNode = document.querySelector(".trail-node[data-node-id='node-1']");
    firstNode.click();

    expect(game.currentNode).toBeDefined();
    expect(game.currentNode.id).toBe("node-1");
    expect(document.getElementById("tree-node-modal").style.display).toBe("flex");
  });

  test("completes 3-step challenge and earns stars", () => {
    game.init();
    const firstNode = document.querySelector(".trail-node[data-node-id='node-1']");
    firstNode.click();

    // Step 1
    game.handleOptionSelection(0, 0, document.createElement("button"));
    expect(game.correctAnswersCount).toBe(1);

    // Step 2
    game.handleOptionSelection(3, 3, document.createElement("button"));
    expect(game.correctAnswersCount).toBe(2);

    // Step 3
    game.handleOptionSelection(0, 0, document.createElement("button"));
    expect(game.correctAnswersCount).toBe(3);

    game.finishNodeChallenge();

    expect(game.state.completedNodes["node-1"]).toBe(3);
    expect(game.state.totalStars).toBe(3);
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });

  test("unlocks passive talents when enough stars are earned", () => {
    game.init();
    game.state.totalStars = 10;
    game.unlockTalent("streak-shield");

    expect(game.state.talents).toContain("streak-shield");
    expect(app.showToast).toHaveBeenCalled();
  });
});
