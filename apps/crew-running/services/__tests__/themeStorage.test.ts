import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// themeStorage runs in 'node' env per vitest config environmentMatchGlobs for services/**
// Need to stub window.localStorage

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => { this.map.set(k, v); };
  removeItem = (k: string) => { this.map.delete(k); };
  clear = () => { this.map.clear(); };
}

let mem: MemoryStorage;

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('window', { localStorage: mem, matchMedia: () => ({ matches: false }) });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('themeStorage', () => {
  it('defaults to dark', async () => {
    const { getThemePreference } = await import('../themeStorage');
    expect(getThemePreference()).toBe('dark');
  });

  it('saves and reads back', async () => {
    const { getThemePreference, saveThemePreference } = await import('../themeStorage');
    saveThemePreference('light');
    expect(getThemePreference()).toBe('light');
  });

  it('falls back to dark on corrupted value', async () => {
    mem.setItem('crewMapTheme', '"bogus"');
    const { getThemePreference } = await import('../themeStorage');
    expect(getThemePreference()).toBe('dark');
  });
});
