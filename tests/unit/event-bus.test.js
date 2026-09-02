import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/utils/event-bus.js";

describe("HSKEventBus", () => {
  let bus;

  beforeEach(() => {
    bus = new window.HSKEventBus();
  });

  describe("Subscription & Emission", () => {
    it("subscribes and receives emitted events with arguments", () => {
      const handler = vi.fn();
      bus.on("test:event", handler);

      bus.emit("test:event", { level: 1 }, "extra");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ level: 1 }, "extra");
    });

    it("supports multiple listeners for the same event", () => {
      const handlerA = vi.fn();
      const handlerB = vi.fn();

      bus.on("app:ready", handlerA);
      bus.on("app:ready", handlerB);

      bus.emit("app:ready");

      expect(handlerA).toHaveBeenCalledTimes(1);
      expect(handlerB).toHaveBeenCalledTimes(1);
    });

    it("unsubscribes via returned unsubscribe function", () => {
      const handler = vi.fn();
      const unsubscribe = bus.on("user:logout", handler);

      bus.emit("user:logout");
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      bus.emit("user:logout");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("unsubscribes via off() method", () => {
      const handler = vi.fn();
      bus.on("theme:change", handler);

      bus.off("theme:change", handler);
      bus.emit("theme:change", "dark");

      expect(handler).not.toHaveBeenCalled();
    });

    it("removes all listeners for an event when off() is called without handler", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on("bulk:event", handler1);
      bus.on("bulk:event", handler2);
      expect(bus.listenerCount("bulk:event")).toBe(2);

      bus.off("bulk:event");
      expect(bus.listenerCount("bulk:event")).toBe(0);

      bus.emit("bulk:event");
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("Once listeners", () => {
    it("fires once listener only once and automatically cleans up", () => {
      const handler = vi.fn();
      bus.once("auth:init", handler);

      expect(bus.listenerCount("auth:init")).toBe(1);

      bus.emit("auth:init", "user-1");
      bus.emit("auth:init", "user-2");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith("user-1");
      expect(bus.listenerCount("auth:init")).toBe(0);
    });
  });

  describe("Error Isolation", () => {
    it("catches errors in individual handlers without interrupting subsequent handlers", () => {
      const badHandler = vi.fn(() => {
        throw new Error("Failure in listener");
      });
      const goodHandler = vi.fn();

      bus.on("data:sync", badHandler);
      bus.on("data:sync", goodHandler);

      expect(() => {
        bus.emit("data:sync", { id: 123 });
      }).not.toThrow();

      expect(badHandler).toHaveBeenCalledTimes(1);
      expect(goodHandler).toHaveBeenCalledTimes(1);
      expect(goodHandler).toHaveBeenCalledWith({ id: 123 });
    });
  });

  describe("Global Instance", () => {
    it("exposes singleton window.hskEventBus", () => {
      expect(window.hskEventBus).toBeDefined();
      expect(typeof window.hskEventBus.emit).toBe("function");
    });
  });
});
