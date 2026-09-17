import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import "../../assets/js/modules/offline-manager.js";

describe("OfflineManager", () => {
  let manager;
  let mockApp;
  let mockCache;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="offline-manager-row">
        <button id="offline-manager-btn"></button>
        <span id="offline-btn-badge"></span>
      </div>

      <dialog id="offline-manager-dialog">
        <button id="offline-modal-close"></button>
        <button id="offline-modal-got-it"></button>
        <div id="offline-stat-strokes-val"></div>
        <div id="offline-stat-percent-val"></div>
        <div id="offline-stat-storage-val"></div>
        <div id="offline-stat-storage-detail"></div>
        <span id="offline-persist-badge"></span>
        <div id="offline-voice-status-badge"></div>
        <div id="offline-voice-status-desc"></div>
        <button id="offline-voice-help-btn"></button>
        <div id="offline-modal-network-status"></div>

        <input type="radio" name="offline-pack-choice" value="all" checked>
        <input type="radio" name="offline-pack-choice" value="hsk1">

        <div id="offline-progress-section" style="display: none;">
          <div id="offline-progress-bar-fill"></div>
          <span id="offline-progress-percent-text"></span>
          <span id="offline-progress-status-text"></span>
          <span id="offline-progress-subtext-counts"></span>
        </div>

        <button id="offline-start-download-btn">
          <span id="offline-download-btn-text"></span>
        </button>
        <button id="offline-retry-download-btn" style="display: none;">
          <span id="offline-retry-btn-text"></span>
        </button>
        <button id="offline-request-persist-btn"></button>
        <button id="offline-clear-cache-btn"></button>
        <button id="offline-export-backup-btn"></button>
        <button id="offline-import-backup-btn"></button>
        <input type="file" id="offline-restore-input">

        <details id="offline-guide-audio-details"></details>
      </dialog>

      <button id="etym-offline-btn"><span id="etym-offline-status"></span></button>
    `;

    mockApp = {
      logDebug: vi.fn(),
      logWarn: vi.fn(),
      logError: vi.fn(),
      getTranslation: vi.fn((key) => key),
      uiController: {
        showToast: vi.fn(),
      },
    };

    mockCache = {
      keys: vi.fn().mockResolvedValue([]),
      match: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    global.caches = {
      open: vi.fn().mockResolvedValue(mockCache),
      delete: vi.fn().mockResolvedValue(true),
      match: vi.fn().mockResolvedValue(null),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        total: 2,
        characters: ["一", "中"],
        levels: { hsk1: ["一"] },
      }),
      text: vi.fn().mockResolvedValue("{}"),
    });

    manager = new window.OfflineManager(mockApp);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes properties correctly", () => {
    expect(manager.cacheName).toBe("hsk-strokes-data");
    expect(manager.isDownloading).toBe(false);
    expect(manager.cachedSet.size).toBe(0);
    expect(manager.failedChars).toEqual([]);
  });

  it("binds events and opens/closes modal", async () => {
    await manager.initialize();
    const dialog = document.getElementById("offline-manager-dialog");
    dialog.showModal = vi.fn();
    dialog.close = vi.fn();

    const openBtn = document.getElementById("offline-manager-btn");
    openBtn.click();
    expect(dialog.showModal).toHaveBeenCalled();

    const closeBtn = document.getElementById("offline-modal-close");
    closeBtn.click();
    expect(dialog.close).toHaveBeenCalled();
  });

  it("loads index data successfully", async () => {
    const data = await manager.loadIndex();
    expect(data).toBeDefined();
    expect(data.total).toBe(2);
    expect(data.characters).toContain("一");
  });

  it("checks cache state with empty cache", async () => {
    mockCache.keys.mockResolvedValue([]);
    const state = await manager.checkCacheState();
    expect(state.cached).toBe(0);
    expect(state.percent).toBe(0);
  });

  it("checks cache state with cached stroke files", async () => {
    mockCache.keys.mockResolvedValue([
      { url: "https://localhost/assets/data/etymology/strokes/%E4%B8%80.json" },
    ]);
    manager.indexData = { total: 2, characters: ["一", "中"] };

    const state = await manager.checkCacheState();
    expect(state.cached).toBe(1);
    expect(state.percent).toBe(50);
    expect(document.getElementById("offline-stat-strokes-val").textContent).toBe("1 / 2");
    expect(document.getElementById("offline-stat-percent-val").textContent).toBe("50%");
  });

  it("downloads character pack and stores in Cache", async () => {
    manager.indexData = {
      total: 2,
      characters: ["一", "中"],
      levels: { hsk1: ["一"] },
    };

    await manager.startDownload("hsk1");
    expect(mockCache.put).toHaveBeenCalled();
    expect(mockApp.uiController.showToast).toHaveBeenCalled();
    expect(manager.isDownloading).toBe(false);
  });

  it("cancels active download when requested", () => {
    manager.isDownloading = true;
    manager.cancelDownload();
    expect(manager.shouldCancel).toBe(true);
    expect(document.getElementById("offline-progress-status-text").textContent).toContain("offlineCancelling");
  });

  it("clears cached strokes and resets state", async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    manager.cachedSet.add("一");

    await manager.clearCache();
    expect(global.caches.delete).toHaveBeenCalledWith("hsk-strokes-data");
    expect(manager.cachedSet.size).toBe(0);
    expect(mockApp.uiController.showToast).toHaveBeenCalled();
  });

  it("updates network indicator on online and offline events", () => {
    manager.updateNetworkState(true);
    const badge = document.getElementById("offline-modal-network-status");
    expect(badge.className).toBe("badge-success");

    manager.updateNetworkState(false);
    expect(badge.className).toBe("badge-warning");
  });

  it("requests storage persistence and updates UI", async () => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        persist: vi.fn().mockResolvedValue(true),
        persisted: vi.fn().mockResolvedValue(true),
        estimate: vi.fn().mockResolvedValue({ usage: 15 * 1024 * 1024, quota: 50 * 1024 * 1024 * 1024 }),
      },
      configurable: true,
    });

    const persisted = await manager.requestPersistence();
    expect(persisted).toBe(true);
    expect(manager.isPersisted).toBe(true);
    const badge = document.getElementById("offline-persist-badge");
    expect(badge.textContent).toContain("Persistente");
  });

  it("estimates storage space and updates display values", async () => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        persist: vi.fn().mockResolvedValue(true),
        persisted: vi.fn().mockResolvedValue(false),
        estimate: vi.fn().mockResolvedValue({ usage: 20 * 1024 * 1024, quota: 10 * 1024 * 1024 * 1024 }),
      },
      configurable: true,
    });

    const info = await manager.updateStorageInfo();
    expect(info).toBeDefined();
    expect(info.usageMB).toBe("20.0");
    expect(info.quotaGB).toBe("10.0");
    expect(document.getElementById("offline-stat-storage-val").textContent).toBe("20.0 MB");
  });

  it("diagnoses Chinese voice availability from SpeechSynthesis", () => {
    global.window.speechSynthesis = {
      getVoices: vi.fn().mockReturnValue([
        { lang: "zh-CN", name: "Ting-Ting" },
        { lang: "en-US", name: "Samantha" },
      ]),
    };

    manager.checkVoiceSupport();
    expect(manager.chineseVoiceInfo.hasChineseVoice).toBe(true);
    expect(manager.chineseVoiceInfo.voiceName).toBe("Ting-Ting");
    const voiceBadge = document.getElementById("offline-voice-status-badge");
    expect(voiceBadge.textContent).toContain("Ting-Ting");
    expect(voiceBadge.className).toBe("badge-success");
  });

  it("handles absence of Chinese voices gracefully", () => {
    global.window.speechSynthesis = {
      getVoices: vi.fn().mockReturnValue([
        { lang: "en-US", name: "Samantha" },
      ]),
    };

    manager.checkVoiceSupport();
    expect(manager.chineseVoiceInfo.hasChineseVoice).toBe(false);
    const voiceBadge = document.getElementById("offline-voice-status-badge");
    expect(voiceBadge.className).toBe("badge-warning");
  });

  it("shows and hides retry button based on failed characters", () => {
    manager.failedChars = ["你", "好"];
    manager.updateRetryButton();
    const retryBtn = document.getElementById("offline-retry-download-btn");
    expect(retryBtn.style.display).toBe("inline-flex");
    expect(document.getElementById("offline-retry-btn-text").textContent).toContain("2");

    manager.hideRetryButton();
    expect(retryBtn.style.display).toBe("none");
  });

  it("exports study progress backup to a JSON download", async () => {
    localStorage.setItem("hsk-user-profile", JSON.stringify({ name: "Alex" }));
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:test");
    global.URL.revokeObjectURL = vi.fn();

    await manager.exportProgress();
    expect(mockApp.uiController.showToast).toHaveBeenCalled();
  });

  it("imports study progress backup file and restores data", async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    const backupContent = JSON.stringify({
      app: "Confuc10++ HSK",
      localStorage: {
        "hsk-theme": "dark",
      },
    });

    const mockFile = {
      text: vi.fn().mockResolvedValue(backupContent),
    };

    await manager.importProgress(mockFile);
    expect(localStorage.getItem("hsk-theme")).toBe("dark");
    expect(mockApp.uiController.showToast).toHaveBeenCalled();
  });
});
