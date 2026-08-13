import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import "../../assets/js/modules/videos-controller.js";

describe("VideosController & Data", () => {
  let controller;
  let mockApp;

  beforeEach(() => {
    localStorage.clear();
    mockApp = {
      logError: vi.fn(),
      logWarn: vi.fn(),
      showNotification: vi.fn(),
    };
    controller = new window.VideosController(mockApp);
  });

  describe("YouTube ID Parser", () => {
    it("parses 11-character direct video IDs", () => {
      expect(controller.parseYouTubeId("a6YtKj-4qxs")).toBe("a6YtKj-4qxs");
      expect(controller.parseYouTubeId("1B2zVvQ1J-4")).toBe("1B2zVvQ1J-4");
    });

    it("parses standard watch URLs", () => {
      expect(
        controller.parseYouTubeId("https://www.youtube.com/watch?v=a6YtKj-4qxs")
      ).toBe("a6YtKj-4qxs");
      expect(
        controller.parseYouTubeId("http://youtube.com/watch?v=1B2zVvQ1J-4&feature=shared")
      ).toBe("1B2zVvQ1J-4");
    });

    it("parses short links (youtu.be)", () => {
      expect(controller.parseYouTubeId("https://youtu.be/a6YtKj-4qxs")).toBe("a6YtKj-4qxs");
    });

    it("parses embed and shorts URLs", () => {
      expect(
        controller.parseYouTubeId("https://www.youtube.com/embed/a6YtKj-4qxs")
      ).toBe("a6YtKj-4qxs");
      expect(
        controller.parseYouTubeId("https://www.youtube.com/shorts/a6YtKj-4qxs")
      ).toBe("a6YtKj-4qxs");
    });

    it("returns null for invalid URLs", () => {
      expect(controller.parseYouTubeId("not_a_valid_youtube_url")).toBeNull();
      expect(controller.parseYouTubeId("https://example.com")).toBeNull();
      expect(controller.parseYouTubeId("")).toBeNull();
    });
  });

  describe("Videos Data Integrity & Interactive Fields", () => {
    const rawData = readFileSync(
      join(process.cwd(), "assets/data/videos-data.json"),
      "utf8"
    );
    const data = JSON.parse(rawData);

    it("contains all 7 required channels", () => {
      const requiredHandles = [
        "@Descubriendo_China",
        "@ChineseClass101",
        "@Wissbegierde",
        "@chinodivertido",
        "@elisalaoshi",
        "@manushi1",
        "@MadeByBilibili",
      ];

      const handlesInFile = data.channels.map((c) => c.handle);
      requiredHandles.forEach((handle) => {
        expect(handlesInFile).toContain(handle);
      });
    });

    it("has valid video entries with HSK level, timestamps, vocab, and quiz", () => {
      const channelIds = new Set(data.channels.map((c) => c.id));
      expect(data.videos.length).toBeGreaterThan(0);

      data.videos.forEach((vid) => {
        expect(channelIds.has(vid.channelId)).toBe(true);
        expect(vid.videoId).toHaveLength(11);
        expect(vid.title.es).toBeTruthy();
        expect(vid.title.en).toBeTruthy();
        expect(vid.description.es).toBeTruthy();
        expect(vid.description.en).toBeTruthy();
        expect(vid.level).toBeTruthy();
        expect(vid.category).toBeTruthy();

        if (vid.timestamps) {
          expect(Array.isArray(vid.timestamps)).toBe(true);
          vid.timestamps.forEach((ts) => {
            expect(typeof ts.time).toBe("number");
            expect(ts.label).toBeTruthy();
          });
        }

        if (vid.vocab) {
          expect(Array.isArray(vid.vocab)).toBe(true);
          vid.vocab.forEach((v) => {
            expect(v.hanzi).toBeTruthy();
            expect(v.pinyin).toBeTruthy();
            expect(v.meaning).toBeTruthy();
          });
        }

        if (vid.quiz) {
          expect(Array.isArray(vid.quiz)).toBe(true);
          vid.quiz.forEach((q) => {
            expect(q.question).toBeTruthy();
            expect(Array.isArray(q.options)).toBe(true);
            expect(typeof q.answer).toBe("number");
          });
        }
      });
    });
  });

  describe("Favorites and Watched Persistence", () => {
    it("toggles and persists favorite video IDs", () => {
      controller.toggleFavorite("vid_01");
      expect(controller.favorites.has("vid_01")).toBe(true);
      expect(JSON.parse(localStorage.getItem("hsk-video-favorites"))).toContain(
        "vid_01"
      );

      controller.toggleFavorite("vid_01");
      expect(controller.favorites.has("vid_01")).toBe(false);
      expect(JSON.parse(localStorage.getItem("hsk-video-favorites"))).not.toContain(
        "vid_01"
      );
    });

    it("toggles and persists watched video IDs", () => {
      controller.toggleWatched("vid_01", true);
      expect(controller.watched.has("vid_01")).toBe(true);
      expect(JSON.parse(localStorage.getItem("hsk-video-watched"))).toContain("vid_01");

      controller.toggleWatched("vid_01", false);
      expect(controller.watched.has("vid_01")).toBe(false);
      expect(JSON.parse(localStorage.getItem("hsk-video-watched"))).not.toContain("vid_01");
    });

    it("stores and manages recently played videos", () => {
      const sampleVid1 = { id: "v1", videoId: "v1111111111", title: { es: "Video 1" }, level: "HSK 1" };
      const sampleVid2 = { id: "v2", videoId: "v2222222222", title: { es: "Video 2" }, level: "HSK 2" };

      controller.addRecentlyPlayed(sampleVid1);
      controller.addRecentlyPlayed(sampleVid2);

      expect(controller.recentlyPlayed[0].id).toBe("v2");
      expect(controller.recentlyPlayed[1].id).toBe("v1");
      expect(JSON.parse(localStorage.getItem("hsk-video-recently-played"))).toHaveLength(2);
    });
  });

  describe("Filtering Logic", () => {
    beforeEach(() => {
      controller.data = {
        channels: [
          { id: "ch1", name: "Descubriendo China", handle: "@Descubriendo_China" },
          { id: "ch2", name: "ChineseClass101", handle: "@ChineseClass101" },
        ],
        videos: [
          {
            id: "v1",
            channelId: "ch1",
            videoId: "v1111111111",
            title: { es: "Gramática HSK 1", en: "HSK 1 Grammar" },
            description: { es: "Aprende chino", en: "Learn Chinese" },
            category: "Gramática",
            level: "HSK 1",
            tags: ["gramatica", "hsk1"],
          },
          {
            id: "v2",
            channelId: "ch2",
            videoId: "v2222222222",
            title: { es: "Cultura en Pekín", en: "Culture in Beijing" },
            description: { es: "Viajes por China", en: "Travel in China" },
            category: "Cultura & Viajes",
            level: "HSK 3",
            tags: ["pekin", "cultura"],
          },
        ],
      };
    });

    it("filters by channel ID", () => {
      controller.activeChannel = "ch1";
      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("v1");
    });

    it("filters by HSK level chip", () => {
      controller.activeFilter = "HSK 3";
      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("v2");
    });

    it("filters by category or level", () => {
      controller.activeFilter = "Gramática";
      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("v1");
    });

    it("filters by search query", () => {
      controller.searchQuery = "pekín";
      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("v2");
    });
  });

  describe("Loop A-B Repetition Mode", () => {
    it("formats seconds into MM:SS correctly", () => {
      expect(controller.formatTime(0)).toBe("00:00");
      expect(controller.formatTime(65)).toBe("01:05");
      expect(controller.formatTime(720)).toBe("12:00");
      expect(controller.formatTime(3665)).toBe("61:05");
    });

    it("sets loop point A and B and toggles active state", () => {
      controller.setLoopPointA(15);
      controller.setLoopPointB(30);

      expect(controller.loopPointA).toBe(15);
      expect(controller.loopPointB).toBe(30);

      controller.toggleLoop();
      expect(controller.isLoopActive).toBe(true);
      expect(controller.loopInterval).not.toBeNull();

      controller.toggleLoop();
      expect(controller.isLoopActive).toBe(false);
      expect(controller.loopInterval).toBeNull();
    });

    it("clears loop points and resets state", () => {
      controller.setLoopPointA(10);
      controller.setLoopPointB(25);
      controller.toggleLoop();

      controller.clearLoop();
      expect(controller.loopPointA).toBeNull();
      expect(controller.loopPointB).toBeNull();
      expect(controller.isLoopActive).toBe(false);
      expect(controller.loopInterval).toBeNull();
    });
  });

  describe("SRS and Etymology Integration", () => {
    it("enrolls vocabulary into SRS engine and persists in local storage", () => {
      const mockRate = vi.fn();
      mockApp.srsEngine = { rate: mockRate };

      controller.addVocabToSRS("长城", "Chángchéng", "Gran Muralla", "HSK 2");

      expect(mockRate).toHaveBeenCalledWith(
        {
          character: "长城",
          pinyin: "Chángchéng",
          meaning: "Gran Muralla",
          level: 2,
        },
        "good"
      );

      const customWords = JSON.parse(localStorage.getItem("hsk-custom-srs-words") || "[]");
      expect(customWords.some((w) => w.character === "长城")).toBe(true);
      expect(mockApp.showNotification).toHaveBeenCalledWith(
        expect.stringContaining("agregada a tus Tarjetas SRS"),
        "success"
      );
    });

    it("triggers tab switch and character lookup when jumping to Etymology", () => {
      const mockSwitchTab = vi.fn();
      mockApp.uiController = { switchTab: mockSwitchTab };

      controller.jumpToEtymology("中国");

      expect(mockSwitchTab).toHaveBeenCalledWith("etymology");
      expect(mockApp.showNotification).toHaveBeenCalledWith(
        expect.stringContaining("Explorando carácter"),
        "info"
      );
    });
  });

  describe("Personal Notes Export & Key Phrases", () => {
    it("validates keyPhrases structure in data if present", () => {
      const rawData = readFileSync(
        join(process.cwd(), "assets/data/videos-data.json"),
        "utf8"
      );
      const data = JSON.parse(rawData);

      const vidsWithPhrases = data.videos.filter((v) => v.keyPhrases);
      expect(vidsWithPhrases.length).toBeGreaterThan(0);

      vidsWithPhrases.forEach((v) => {
        v.keyPhrases.forEach((p) => {
          expect(p.hanzi).toBeTruthy();
          expect(p.pinyin).toBeTruthy();
          expect(p.meaning).toBeTruthy();
        });
      });
    });
  });
});
