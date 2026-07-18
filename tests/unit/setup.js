// Stub de localStorage en memoria para los unit tests.
//
// Con Node 25 + jsdom 29, window.localStorage delega en el localStorage
// experimental de Node, que sin --localstorage-file no implementa la API
// (clear/setItem fallan). Este stub in-memory es determinista y se limpia
// entre tests desde cada beforeEach.
class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(String(key)) ? this.map.get(String(key)) : null;
  }
  setItem(key, value) {
    this.map.set(String(key), String(value));
  }
  removeItem(key) {
    this.map.delete(String(key));
  }
  clear() {
    this.map.clear();
  }
  get length() {
    return this.map.size;
  }
  key(index) {
    return [...this.map.keys()][index] ?? null;
  }
}

const storage = new MemoryStorage();

Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
