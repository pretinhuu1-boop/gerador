import { afterEach, beforeEach } from 'vitest';

// happy-dom ships a no-op localStorage in this version of vitest, which
// silently drops writes. Tests that touch services/storage rely on a real
// persistence layer between calls, so swap in a minimal in-memory Storage.
const hasDom = typeof window !== 'undefined';

if (hasDom) {
  await import('@testing-library/jest-dom/vitest');

  class MemoryStorage implements Storage {
    private map = new Map<string, string>();
    get length() {
      return this.map.size;
    }
    key(i: number) {
      return Array.from(this.map.keys())[i] ?? null;
    }
    getItem(k: string) {
      return this.map.get(k) ?? null;
    }
    setItem(k: string, v: string) {
      this.map.set(k, String(v));
    }
    removeItem(k: string) {
      this.map.delete(k);
    }
    clear() {
      this.map.clear();
    }
  }

  const installStorage = () => {
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      writable: false,
      configurable: true,
    });
  };

  installStorage();
  beforeEach(installStorage);

  const { cleanup } = await import('@testing-library/react');
  afterEach(() => {
    cleanup();
  });
}
