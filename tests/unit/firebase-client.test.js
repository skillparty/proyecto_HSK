import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/firebase-client.js";

describe("FirebaseClient", () => {
  let client;
  let mockAuth;
  let mockDb;
  let mockSDK;

  beforeEach(() => {
    mockAuth = {};
    mockDb = {};

    mockSDK = {
      GithubAuthProvider: vi.fn(),
      signInWithPopup: vi.fn().mockResolvedValue({
        user: { uid: "test-uid-1", displayName: "Tester", email: "test@example.com" },
      }),
      signOut: vi.fn().mockResolvedValue(),
      onAuthStateChanged: vi.fn((auth, callback) => {
        // immediately notify
        callback({ uid: "test-uid-1", displayName: "Tester", email: "test@example.com" });
        return vi.fn();
      }),
      doc: vi.fn((db, coll, id) => ({ path: `${coll}/${id}` })),
      collection: vi.fn((db, coll) => ({ name: coll })),
      query: vi.fn((coll) => ({ coll })),
      where: vi.fn(),
      orderBy: vi.fn(),
      getDocs: vi.fn().mockResolvedValue({
        forEach: (fn) => [
          { data: () => ({ total_words_studied: 50, correct_answers: 45, best_streak: 10, last_studied: new Date() }) },
          { data: () => ({ total_words_studied: 30, correct_answers: 25, best_streak: 5, last_studied: new Date() }) },
        ].forEach(fn),
      }),
      getDoc: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ theme: "dark", language: "es" }),
      }),
      setDoc: vi.fn().mockResolvedValue(),
      serverTimestamp: vi.fn().mockReturnValue("2026-09-01T00:00:00Z"),
    };

    window.firebaseAuth = mockAuth;
    window.firebaseDb = mockDb;
    window.FirebaseSDK = mockSDK;
    window.languageManager = { t: (k) => k };

    document.body.innerHTML = '<div id="auth-container"></div>';

    client = new window.FirebaseClient();
  });

  describe("Initialization", () => {
    it("initializes successfully when Firebase global objects are present", async () => {
      await client.initialize();

      expect(client.initialized).toBe(true);
      expect(client.auth).toBe(mockAuth);
      expect(client.db).toBe(mockDb);
      expect(client.user).toEqual(
        expect.objectContaining({ uid: "test-uid-1", displayName: "Tester" }),
      );
    });

    it("handles escapeHtml via hskEscapeHtml", () => {
      expect(client.escapeHtml("<b>test</b>")).toBe("&lt;b&gt;test&lt;/b&gt;");
    });
  });

  describe("Authentication", () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it("signs in with GitHub using Firebase SDK popup", async () => {
      const result = await client.signInWithGitHub();

      expect(mockSDK.signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object));
      expect(result.user.uid).toBe("test-uid-1");
      expect(client.user).toEqual(result.user);
    });

    it("signs out and clears user state", async () => {
      await client.signOut();

      expect(mockSDK.signOut).toHaveBeenCalledWith(mockAuth);
      expect(client.user).toBeNull();
    });
  });

  describe("User Profile & Statistics", () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it("fetches user profile from Firestore", async () => {
      const profile = await client.getUserProfile();

      expect(mockSDK.doc).toHaveBeenCalledWith(mockDb, "user_profiles", "test-uid-1");
      expect(profile).toEqual({ theme: "dark", language: "es" });
    });

    it("updates user profile in Firestore with merge", async () => {
      await client.updateUserProfile({ theme: "light" });

      expect(mockSDK.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "user_profiles/test-uid-1" }),
        expect.objectContaining({ user_id: "test-uid-1", theme: "light" }),
        { merge: true },
      );
    });

    it("calculates aggregated leaderboard stats", async () => {
      const stats = await client.getLeaderboardStats();

      expect(stats.total_active_users).toBe(2);
      expect(stats.total_words_studied).toBe(80);
      expect(stats.avg_words_per_user).toBe(40);
      expect(stats.max_streak).toBe(10);
    });
  });

  describe("SRS Records Persistence", () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it("saves SRS records to srs_data collection", async () => {
      const records = { 你好: { reps: 3, interval: 7 } };
      await client.saveSRSRecords(records);

      expect(mockSDK.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "srs_data/test-uid-1" }),
        expect.objectContaining({ records }),
      );
    });

    it("loads SRS records from srs_data collection", async () => {
      mockSDK.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ records: { 你好: { reps: 4 } } }),
      });

      const records = await client.loadSRSRecords();
      expect(records).toEqual({ 你好: { reps: 4 } });
    });
  });
});
