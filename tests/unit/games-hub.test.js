import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/games-hub-controller.js";

const stubApp = () => ({
  currentLanguage: "es",
  switchTab: vi.fn(),
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
  showToast: vi.fn(),
  stats: {
    tonesInvadersHighScore: 1500,
    matrixHighScore: 820,
  },
  audioController: {
    toggleAudio: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="games" class="tab-panel active" data-tab="games">
      <div class="games-hub-container">
        <header class="gh-hero-banner">
          <span id="gh-total-games-count">0</span>
          <span id="gh-high-scores-sum">0</span>
          <span id="gh-games-played-count">0</span>
        </header>

        <section class="gh-featured-section">
          <span class="gh-bonus-xp">+50 XP Bonus</span>
          <h3 id="gh-featured-title"></h3>
          <p id="gh-featured-desc"></p>
          <span id="gh-featured-skill"></span>
          <button type="button" id="gh-featured-play-btn" data-target-tab=""></button>
        </section>

        <section class="gh-controls-bar">
          <div id="gh-filter-chips">
            <button type="button" class="gh-chip-btn active" data-filter="all">Todos</button>
            <button type="button" class="gh-chip-btn" data-filter="tones">Tonos</button>
            <button type="button" class="gh-chip-btn" data-filter="radicals">Radicales</button>
            <button type="button" class="gh-chip-btn" data-filter="vocab">Vocabulario</button>
            <button type="button" class="gh-chip-btn" data-filter="grammar">Gramática</button>
            <button type="button" class="gh-chip-btn" data-filter="culture">Cultura</button>
          </div>
          <input type="text" id="gh-search-input" />
        </section>

        <main id="gh-games-grid"></main>
      </div>
    </div>

    <!-- Dummy game panels to test topbar injection -->
    <div id="tones-invaders" class="tab-panel">
      <div class="tones-inv-shell"></div>
    </div>
    <div id="snake-quantifiers" class="tab-panel">
      <div class="snakeq-shell"></div>
    </div>
    <div id="hanzi-builder" class="tab-panel">
      <div class="hanzi-build-shell"></div>
    </div>
    <div id="tone-trainer" class="tab-panel">
      <div class="tone-trainer-container"></div>
    </div>
    <div id="china-cities" class="tab-panel">
      <div class="cities-container"></div>
    </div>
  `;
};

describe("GamesHubController", () => {
  let app;
  let controller;

  beforeEach(() => {
    localStorage.clear();
    setupDOM();
    app = stubApp();
    window.app = app;
    controller = new window.GamesHubController(app);
  });

  test("instantiates with 12 games catalog", () => {
    expect(controller.gamesList).toHaveLength(12);
    const gameIds = controller.gamesList.map((g) => g.id);
    expect(gameIds).toContain("tones-invaders");
    expect(gameIds).toContain("snake-quantifiers");
    expect(gameIds).toContain("hanzi-builder");
    expect(gameIds).toContain("word-linker");
    expect(gameIds).toContain("sentence-builder");
    expect(gameIds).toContain("hanzi-mahjong");
    expect(gameIds).toContain("matrix");
    expect(gameIds).toContain("tone-trainer");
    expect(gameIds).toContain("radical-decomposer");
    expect(gameIds).toContain("china-cities");
    expect(gameIds).toContain("shadow-theatre");
    expect(gameIds).toContain("lyrics-lab");
  });

  test("init caches elements and populates stats and daily featured game", () => {
    controller.init();

    const totalEl = document.getElementById("gh-total-games-count");
    expect(totalEl.textContent).toBe("12");

    const sumEl = document.getElementById("gh-high-scores-sum");
    expect(parseInt(sumEl.textContent.replace(/,/g, ""), 10)).toBeGreaterThanOrEqual(2320); // 1500 + 820

    const featuredTitle = document.getElementById("gh-featured-title");
    expect(featuredTitle.textContent.length).toBeGreaterThan(0);

    const playBtn = document.getElementById("gh-featured-play-btn");
    expect(playBtn.getAttribute("data-target-tab")).toBeTruthy();
  });

  test("renders all 12 game cards initially", () => {
    controller.init();
    const grid = document.getElementById("gh-games-grid");
    const cards = grid.querySelectorAll(".gh-game-card");
    expect(cards).toHaveLength(12);
  });

  test("filtering by skill updates card count", () => {
    controller.init();
    const grid = document.getElementById("gh-games-grid");

    const tonesChip = document.querySelector('.gh-chip-btn[data-filter="tones"]');
    tonesChip.click();
    expect(controller.activeFilter).toBe("tones");
    expect(grid.querySelectorAll(".gh-game-card").length).toBe(2); // tones-invaders, tone-trainer

    const vocabChip = document.querySelector('.gh-chip-btn[data-filter="vocab"]');
    vocabChip.click();
    expect(controller.activeFilter).toBe("vocab");
    expect(grid.querySelectorAll(".gh-game-card").length).toBe(2); // word-linker, matrix

    const radicalsChip = document.querySelector('.gh-chip-btn[data-filter="radicals"]');
    radicalsChip.click();
    expect(controller.activeFilter).toBe("radicals");
    expect(grid.querySelectorAll(".gh-game-card").length).toBe(3); // hanzi-builder, hanzi-mahjong, radical-decomposer

    const grammarChip = document.querySelector('.gh-chip-btn[data-filter="grammar"]');
    grammarChip.click();
    expect(controller.activeFilter).toBe("grammar");
    expect(grid.querySelectorAll(".gh-game-card").length).toBe(2); // snake-quantifiers, sentence-builder

    const cultureChip = document.querySelector('.gh-chip-btn[data-filter="culture"]');
    cultureChip.click();
    expect(controller.activeFilter).toBe("culture");
    expect(grid.querySelectorAll(".gh-game-card").length).toBe(3); // china-cities, shadow-theatre, lyrics-lab
  });

  test("search input filters game cards", () => {
    controller.init();
    const input = document.getElementById("gh-search-input");
    input.value = "mahjong";
    input.dispatchEvent(new Event("input"));

    const grid = document.getElementById("gh-games-grid");
    const cards = grid.querySelectorAll(".gh-game-card");
    expect(cards.length).toBe(1);
    expect(cards[0].querySelector(".gh-card-name").textContent).toContain("Mahjong");

    // Empty search match
    input.value = "xyznonexistent";
    input.dispatchEvent(new Event("input"));
    const emptyCards = grid.querySelectorAll(".gh-game-card");
    expect(emptyCards.length).toBe(0);
    expect(grid.textContent).toContain("No se encontraron juegos");
  });

  test("clicking play button on a card switches tab and records launch count", () => {
    controller.init();
    const grid = document.getElementById("gh-games-grid");
    const firstPlayBtn = grid.querySelector('.gh-btn-play[data-tab-launch="tones-invaders"]');
    expect(firstPlayBtn).toBeTruthy();

    firstPlayBtn.click();
    expect(app.switchTab).toHaveBeenCalledWith("tones-invaders");
    expect(localStorage.getItem("hsk_total_games_played")).toBe("1");

    const playedEl = document.getElementById("gh-games-played-count");
    expect(playedEl.textContent).toBe("1");
  });

  test("featured play button triggers switchTab to featured tab", () => {
    controller.init();
    const playBtn = document.getElementById("gh-featured-play-btn");
    const targetTab = playBtn.getAttribute("data-target-tab");
    playBtn.click();
    expect(app.switchTab).toHaveBeenCalledWith(targetTab);
  });

  test("injects arcade topbar into game shells and wires back / switcher / audio", () => {
    controller.init();
    const tonesPanel = document.getElementById("tones-invaders");
    const topBar = tonesPanel.querySelector(".game-arcade-topbar");
    expect(topBar).toBeTruthy();

    // Test back button
    const backBtn = topBar.querySelector('[data-action="return-games"]');
    backBtn.click();
    expect(app.switchTab).toHaveBeenCalledWith("games");

    // Test switcher
    const switcher = topBar.querySelector(".game-switcher-select");
    expect(switcher.value).toBe("tones-invaders");
    switcher.value = "snake-quantifiers";
    switcher.dispatchEvent(new Event("change"));
    expect(app.switchTab).toHaveBeenCalledWith("snake-quantifiers");

    // Test audio toggle
    const audioBtn = topBar.querySelector('[data-action="toggle-audio"]');
    audioBtn.click();
    expect(app.audioController.toggleAudio).toHaveBeenCalled();
  });

  test("keyboard scroll lock intercepts arrow keys and space during gameplay", () => {
    controller.init();
    const event = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    // Active tab is "games", shouldn't prevent
    window.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    // Switch active panel to snake-quantifiers
    document.getElementById("games").classList.remove("active");
    const snakePanel = document.getElementById("snake-quantifiers");
    snakePanel.classList.add("active");

    const arrowEvent = new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true });
    const arrowSpy = vi.spyOn(arrowEvent, "preventDefault");
    window.dispatchEvent(arrowEvent);
    expect(arrowSpy).toHaveBeenCalled();

    // If focused on an input, should NOT prevent default
    const dummyInput = document.createElement("input");
    document.body.appendChild(dummyInput);
    dummyInput.focus();

    const inputArrowEvent = new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true });
    const inputSpy = vi.spyOn(inputArrowEvent, "preventDefault");
    window.dispatchEvent(inputArrowEvent);
    expect(inputSpy).not.toHaveBeenCalled();
    dummyInput.remove();
  });

  test("handles multilingual rendering (en, ru, th)", () => {
    controller.init();
    app.currentLanguage = "en";
    controller.renderCards();
    controller.renderFeaturedGame();

    const grid = document.getElementById("gh-games-grid");
    const titles = Array.from(grid.querySelectorAll(".gh-card-name")).map((el) => el.textContent);
    expect(titles).toContain("Tones Invaders");
    expect(titles).toContain("Quantifier Snake");

    app.currentLanguage = "ru";
    controller.renderCards();
    const ruTitles = Array.from(grid.querySelectorAll(".gh-card-name")).map((el) => el.textContent);
    expect(ruTitles).toContain("Захватчики тонов");

    app.currentLanguage = "th";
    controller.renderCards();
    const thTitles = Array.from(grid.querySelectorAll(".gh-card-name")).map((el) => el.textContent);
    expect(thTitles).toContain("ยานรบฝึกวรรณยุกต์");
  });

  test("refresh re-evaluates high scores and re-renders cards and featured game", () => {
    controller.init();
    app.stats.tonesInvadersHighScore = 3000;
    controller.refresh();

    const sumEl = document.getElementById("gh-high-scores-sum");
    expect(parseInt(sumEl.textContent.replace(/,/g, ""), 10)).toBeGreaterThanOrEqual(3820);
  });

  test("claims daily featured game bonus when matching game completes", () => {
    controller.init();
    const todayGame = controller.getDailyFeaturedGame();
    expect(controller.isDailyBonusClaimed()).toBe(false);

    // Simulate completion of another game
    document.dispatchEvent(new CustomEvent("hsk:game-result", {
      detail: { game: "different-game", score: 100 }
    }));
    expect(controller.isDailyBonusClaimed()).toBe(false);

    // Simulate completion of today's featured game
    document.dispatchEvent(new CustomEvent("hsk:game-result", {
      detail: { game: todayGame.id, score: 500 }
    }));
    expect(controller.isDailyBonusClaimed()).toBe(true);
    expect(app.showToast).toHaveBeenCalled();
    expect(Number(localStorage.getItem("hsk_culture_trivia_xp"))).toBeGreaterThanOrEqual(50);
  });

  test("injects topbar into tone-trainer and handles scroll lock on tone-trainer tab", () => {
    controller.init();
    const ttPanel = document.getElementById("tone-trainer");
    const topBar = ttPanel.querySelector(".game-arcade-topbar");
    expect(topBar).toBeTruthy();

    // Scroll lock on tone-trainer
    document.getElementById("games").classList.remove("active");
    ttPanel.classList.add("active");

    const arrowEvent = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true });
    const arrowSpy = vi.spyOn(arrowEvent, "preventDefault");
    window.dispatchEvent(arrowEvent);
    expect(arrowSpy).toHaveBeenCalled();
  });

  test("renders custom badges and scores for exploratory and cultural activities", () => {
    localStorage.setItem("hsk_unlocked_city_stamps", JSON.stringify(["beijing", "xian", "shanghai"]));
    controller.init();

    const grid = document.getElementById("gh-games-grid");
    const citiesCard = grid.querySelector('.gh-game-card[data-game="china-cities"]');
    expect(citiesCard).toBeTruthy();
    expect(citiesCard.querySelector(".gh-score-label").textContent).toBe("Sellos de Viaje");
    expect(citiesCard.querySelector(".gh-score-val").textContent).toContain("3 desbloqueados");
    expect(citiesCard.querySelector(".gh-btn-play").textContent).toContain("Viajar");

    const decompCard = grid.querySelector('.gh-game-card[data-game="radical-decomposer"]');
    expect(decompCard.querySelector(".gh-score-label").textContent).toBe("Modalidad");
    expect(decompCard.querySelector(".gh-score-val").textContent).toBe("Laboratorio");
    expect(decompCard.querySelector(".gh-btn-play").textContent).toContain("Explorar");
  });
});

