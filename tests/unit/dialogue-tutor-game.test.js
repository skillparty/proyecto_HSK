import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/dialogue-tutor-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playChime: vi.fn(),
  },
  achievementManager: {
    unlock: vi.fn(),
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="dialogue-tutor">
      <div id="tutor-scenarios-bar"></div>
      <div id="tutor-scenario-icon"></div>
      <h3 id="tutor-scenario-name"></h3>
      <p id="tutor-scenario-desc"></p>
      <strong id="tutor-fluency-score">100%</strong>
      <div id="tutor-chat-feed"></div>
      <div id="tutor-reply-section">
        <button id="tutor-mic-btn">🎙️</button>
        <div id="tutor-reply-options"></div>
      </div>
      <div id="tutor-finished-banner" style="display: none;">
        <button id="tutor-replay-btn">Replay</button>
        <button id="tutor-next-scenario-btn">Next</button>
      </div>
    </div>
  `;
};

describe("DialogueTutorGame", () => {
  let app;
  let tutor;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    tutor = new window.DialogueTutorGame(app);
  });

  test("initializes correctly and loads first scenario", () => {
    tutor.init();
    expect(tutor.currentScenario).toBeDefined();
    expect(tutor.currentScenario.id).toBe("restaurant");
    expect(document.getElementById("tutor-scenario-name").textContent).toContain("在餐厅点菜");
    expect(document.querySelectorAll(".tutor-chat-message.bot").length).toBe(1);
  });

  test("renders reply options for current turn", () => {
    tutor.init();
    const options = document.querySelectorAll(".tutor-reply-card");
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  test("processes user reply, appends to chat, and advances turn", () => {
    tutor.init();
    const firstOption = tutor.currentScenario.turns[0].options[0];
    tutor.handleUserReply(firstOption);

    expect(tutor.earnedScore).toBe(firstOption.score);
    expect(tutor.currentTurnIndex).toBe(1);
    expect(document.querySelectorAll(".tutor-chat-message.user").length).toBe(1);
  });

  test("completes scenario and unlocks tutor-master achievement", () => {
    tutor.init();
    const turnsCount = tutor.currentScenario.turns.length;

    for (let i = 0; i < turnsCount; i++) {
      const turn = tutor.currentScenario.turns[i];
      tutor.handleUserReply(turn.options[0]);
    }

    tutor.finishScenario();

    const banner = document.getElementById("tutor-finished-banner");
    expect(banner.style.display).toBe("block");
    expect(app.achievementManager.unlock).toHaveBeenCalledWith("tutor-master");
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });

  test("matches transcript with best option in speech recognition", () => {
    tutor.init();
    const turn = tutor.currentScenario.turns[0];
    const targetOption = turn.options[0];

    tutor.matchTranscriptWithOption("两位靠窗桌子");
    expect(tutor.earnedScore).toBe(targetOption.score);
  });
});
