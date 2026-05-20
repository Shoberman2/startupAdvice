import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearAll,
  isPinned,
  listPinned,
  makePinId,
  pin,
  unpin,
  STORAGE_KEY_EXPORTED_FOR_TESTS,
  type PinnedItem,
} from "./storage";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  get length(): number {
    return this.store.size;
  }
  key(i: number): string | null {
    return Array.from(this.store.keys())[i] ?? null;
  }
}

declare const globalThis: typeof global & { window?: { localStorage: MemoryStorage } };

function installFakeWindow(): MemoryStorage {
  const storage = new MemoryStorage();
  globalThis.window = { localStorage: storage };
  return storage;
}

function makeItem(over: Partial<PinnedItem> = {}): PinnedItem {
  return {
    id: makePinId("paul-graham", "Make something people want."),
    founderSlug: "paul-graham",
    founderName: "Paul Graham",
    questionText: "How do I find PMF?",
    answerText: "Make something people want.",
    source: "/panel",
    pinnedAt: Date.now(),
    ...over,
  };
}

describe("pinned storage", () => {
  beforeEach(() => {
    installFakeWindow();
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("returns an empty list when storage is empty", () => {
    expect(listPinned()).toEqual([]);
    expect(isPinned("nonexistent")).toBe(false);
  });

  it("pins an item and reads it back", () => {
    const item = makeItem();
    expect(pin(item)).toBe(true);
    expect(isPinned(item.id)).toBe(true);
    expect(listPinned().length).toBe(1);
  });

  it("pinning the same id twice is idempotent", () => {
    const item = makeItem();
    expect(pin(item)).toBe(true);
    expect(pin(item)).toBe(true);
    expect(listPinned().length).toBe(1);
  });

  it("unpins an item", () => {
    const item = makeItem();
    pin(item);
    expect(unpin(item.id)).toBe(true);
    expect(isPinned(item.id)).toBe(false);
    expect(listPinned()).toEqual([]);
  });

  it("unpinning a nonexistent id is a no-op", () => {
    expect(unpin("nothing")).toBe(true);
    expect(listPinned()).toEqual([]);
  });

  it("returns items in newest-first order", () => {
    const oldItem = makeItem({ id: "a", pinnedAt: 1000, answerText: "old" });
    const newItem = makeItem({ id: "b", pinnedAt: 2000, answerText: "new" });
    pin(oldItem);
    pin(newItem);
    const list = listPinned();
    expect(list[0].id).toBe("b");
    expect(list[1].id).toBe("a");
  });

  it("clearAll empties the list", () => {
    pin(makeItem({ id: "a" }));
    pin(makeItem({ id: "b" }));
    expect(clearAll()).toBe(true);
    expect(listPinned()).toEqual([]);
  });

  it("drops malformed entries silently on read", () => {
    installFakeWindow().setItem(
      STORAGE_KEY_EXPORTED_FOR_TESTS,
      JSON.stringify([
        { id: "good", founderSlug: "paul-graham", founderName: "Paul Graham", questionText: "q", answerText: "a", source: "/panel", pinnedAt: 1 },
        { id: "bad", missingFields: true },
        "not even an object",
      ]),
    );
    const list = listPinned();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("good");
  });

  it("returns empty list when localStorage is unavailable", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(listPinned()).toEqual([]);
    expect(isPinned("anything")).toBe(false);
    expect(pin(makeItem())).toBe(false);
  });

  it("makePinId is stable for the same input", () => {
    const a = makePinId("naval", "Specific knowledge × leverage × judgment.");
    const b = makePinId("naval", "Specific knowledge × leverage × judgment.");
    expect(a).toBe(b);
  });

  it("makePinId differs for different founders or texts", () => {
    expect(makePinId("naval", "X")).not.toBe(makePinId("paul-graham", "X"));
    expect(makePinId("naval", "X")).not.toBe(makePinId("naval", "Y"));
  });
});
