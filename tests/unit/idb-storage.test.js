import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/idb-storage.js";

describe("idbStorage utility", () => {
  beforeEach(() => {
    // Mock global indexedDB for JSDOM
    const mockStore = new Map();

    const mockIDBStore = {
      get: vi.fn((key) => {
        const req = { result: mockStore.get(key), onsuccess: null, onerror: null };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      }),
      put: vi.fn((val, key) => {
        mockStore.set(key, val);
        const req = { onsuccess: null, onerror: null };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      }),
      delete: vi.fn((key) => {
        mockStore.delete(key);
        const req = { onsuccess: null, onerror: null };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      }),
    };

    const mockDB = {
      objectStoreNames: { contains: () => true },
      createObjectStore: vi.fn(),
      transaction: () => ({
        objectStore: () => mockIDBStore,
      }),
    };

    window.indexedDB = {
      open: vi.fn(() => {
        const req = { result: mockDB, onsuccess: null, onerror: null, onupgradeneeded: null };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };
  });

  test("sets, gets and deletes values from IndexedDB", async () => {
    await window.idbStorage.set("test_key", { count: 42 });
    const val = await window.idbStorage.get("test_key");
    expect(val).toEqual({ count: 42 });

    await window.idbStorage.del("test_key");
    const valAfterDel = await window.idbStorage.get("test_key");
    expect(valAfterDel).toBeUndefined();
  });

  test("handles missing or error states gracefully", async () => {
    const res = await window.idbStorage.get("non_existent_key");
    expect(res).toBeUndefined();
  });
});
