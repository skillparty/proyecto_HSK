import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/auth-backend.js";

describe("BackendAuth", () => {
  let auth;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="auth-container"></div>';

    window.firebaseClient = {
      initialized: true,
      getCurrentUser: vi.fn().mockReturnValue(null),
      signInWithGitHub: vi.fn().mockResolvedValue(),
      signOut: vi.fn().mockResolvedValue(),
    };

    window.languageManager = {
      t: (key) => key,
      getText: (key) => key,
    };

    auth = new window.BackendAuth();
  });

  describe("Initial State & Helpers", () => {
    it("initializes with null user and token", () => {
      expect(auth.getUser()).toBeNull();
      expect(auth.getToken()).toBeNull();
      expect(auth.isAuthenticated()).toBe(false);
    });

    it("detects static hosting properly", () => {
      expect(typeof auth.isStaticHosting()).toBe("boolean");
    });

    it("delegates escapeHtml to window.hskEscapeHtml", () => {
      const escaped = auth.escapeHtml('<script>alert("xss")</script>');
      expect(escaped).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    });

    it("returns key if languageManager is not present or t() is called", () => {
      expect(auth.t("login")).toBe("login");
    });
  });

  describe("fetchCurrentUser", () => {
    it("sets currentUser when Firebase user is available", async () => {
      window.firebaseClient.getCurrentUser.mockReturnValue({
        uid: "user-123",
        displayName: "Zhang San",
        email: "zhang@example.com",
        photoURL: "https://example.com/avatar.jpg",
      });

      const result = await auth.fetchCurrentUser();
      expect(result).toBe(true);
      expect(auth.isAuthenticated()).toBe(true);

      const user = auth.getUser();
      expect(user.id).toBe("user-123");
      expect(user.username).toBe("zhangsan");
      expect(user.name).toBe("Zhang San");
      expect(user.email).toBe("zhang@example.com");
      expect(user.avatar_url).toBe("https://example.com/avatar.jpg");
    });

    it("returns false when Firebase returns no user", async () => {
      window.firebaseClient.getCurrentUser.mockReturnValue(null);

      const result = await auth.fetchCurrentUser();
      expect(result).toBe(false);
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getUser()).toBeNull();
    });

    it("handles uninitialized firebaseClient gracefully", async () => {
      window.firebaseClient = null;
      const result = await auth.fetchCurrentUser();
      expect(result).toBe(false);
    });
  });

  describe("Login & Logout", () => {
    it("calls firebaseClient.signInWithGitHub on login()", async () => {
      await auth.login();
      expect(window.firebaseClient.signInWithGitHub).toHaveBeenCalled();
    });

    it("calls firebaseClient.signOut and resets local state on logout()", async () => {
      auth.currentUser = { id: "user-123", username: "testuser" };
      auth.accessToken = "sample-token";
      localStorage.setItem("auth-token", "sample-token");

      await auth.logout();

      expect(window.firebaseClient.signOut).toHaveBeenCalled();
      expect(auth.getUser()).toBeNull();
      expect(auth.getToken()).toBeNull();
      expect(auth.isAuthenticated()).toBe(false);
      expect(localStorage.getItem("auth-token")).toBeNull();
    });
  });

  describe("UI Rendering", () => {
    it("renders guest mode UI when user is not authenticated", () => {
      auth.currentUser = null;
      auth.showGuestMode();

      const container = document.getElementById("auth-container");
      expect(container.innerHTML).toContain("auth-guest-mode");
      expect(container.querySelector("#github-login-btn")).not.toBeNull();
    });

    it("renders user profile UI when user is authenticated", () => {
      auth.currentUser = {
        id: "uid-abc",
        username: "learner42",
        name: "Learner 42",
        avatar_url: "https://example.com/avatar.png",
      };

      auth.showUserProfile();

      const container = document.getElementById("auth-container");
      expect(container.innerHTML).toContain("user-profile");
      expect(container.innerHTML).toContain("Learner 42");
      expect(container.innerHTML).toContain("@learner42");
      expect(container.querySelector("#logout-btn")).not.toBeNull();
    });
  });

  describe("apiCall handling", () => {
    it("skips legacy backend api calls when legacyBackendApiEnabled is false", async () => {
      auth.legacyBackendApiEnabled = false;
      const response = await auth.apiCall("/api/progress");
      const data = await response.json();

      expect(response.status).toBe(204);
      expect(data.skipped).toBe(true);
    });
  });
});
