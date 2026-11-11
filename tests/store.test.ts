import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { MAX_TEXT_LENGTH, MessageStore, STORAGE_KEY, type KeyValueStorage } from '../src/core/store';
import { SEED_MESSAGES } from '../src/data/seeds';
import { ROOMS } from '../src/data/rooms';
import { computeMarkers } from '../src/core/markers';
import { EMOTIONS } from '../src/types';

class FakeStorage implements KeyValueStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

const roomIds = ROOMS.map((r) => r.id);
const nonBlank = fc.string({ minLength: 1, maxLength: MAX_TEXT_LENGTH }).filter((s) => s.trim().length > 0);

describe('MessageStore', () => {
  it('starts with seed messages', () => {
    expect(new MessageStore(new FakeStorage()).all()).toHaveLength(SEED_MESSAGES.length);
  });

  it('persists across instances (round trip)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...roomIds), nonBlank, fc.constantFrom(...EMOTIONS), (room, text, emotion) => {
        const storage = new FakeStorage();
        const saved = new MessageStore(storage).add(room, text, emotion);
        expect(saved).not.toBeNull();
        const found = new MessageStore(storage).all().find((m) => m.id === saved!.id);
        expect(found).toEqual(saved);
        expect(found!.text).toBe(text.trim());
      }),
    );
  });

  it('rejects blank text, unknown rooms and bad emotions', () => {
    const s = new MessageStore(new FakeStorage());
    expect(s.add('lobby', '   ', 'fear')).toBeNull();
    expect(s.add('nope', 'hi', 'fear')).toBeNull();
    expect(s.add('lobby', 'hi', 'joy' as never)).toBeNull();
  });

  it('truncates overly long text', () => {
    const s = new MessageStore(new FakeStorage());
    const m = s.add('lobby', 'a'.repeat(1000), 'eerie');
    expect(m!.text).toHaveLength(MAX_TEXT_LENGTH);
  });

  it('survives corrupted storage', () => {
    fc.assert(
      fc.property(fc.string(), (garbage) => {
        const storage = new FakeStorage();
        storage.setItem(STORAGE_KEY, garbage);
        expect(() => new MessageStore(storage)).not.toThrow();
        expect(new MessageStore(storage).all().length).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('drops invalid entries but keeps valid ones', () => {
    const storage = new FakeStorage();
    const good = SEED_MESSAGES[0];
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, messages: [good, { id: 1 }, null] }));
    expect(new MessageStore(storage).all()).toEqual([good]);
  });

  it('works without storage', () => {
    const s = new MessageStore(null);
    expect(s.add('lobby', 'hello', 'calm')).not.toBeNull();
  });

  it('clear and reset work', () => {
    const s = new MessageStore(new FakeStorage());
    s.clear();
    expect(s.all()).toHaveLength(0);
    s.reset();
    expect(s.all()).toHaveLength(SEED_MESSAGES.length);
  });

  it('sorts room messages newest first', () => {
    const s = new MessageStore(new FakeStorage());
    s.add('lobby', 'later', 'calm', Date.UTC(2030, 0, 1));
    expect(s.byRoom('lobby')[0].text).toBe('later');
  });
});

describe('computeMarkers', () => {
  it('counts add up to the number of messages', () => {
    const msgArb = fc.record({
      id: fc.string(),
      roomId: fc.constantFrom(...roomIds),
      text: fc.string({ minLength: 1 }),
      emotion: fc.constantFrom(...EMOTIONS),
      createdAt: fc.integer({ min: 0 }),
    });
    fc.assert(
      fc.property(fc.array(msgArb), (messages) => {
        const total = computeMarkers(messages, ROOMS).reduce((s, m) => s + m.count, 0);
        expect(total).toBe(messages.length);
      }),
    );
  });

  it('ignores messages from unknown rooms', () => {
    const m = { id: 'x', roomId: 'ghost', text: 'a', emotion: 'fear' as const, createdAt: 1 };
    expect(computeMarkers([m], ROOMS)).toEqual([]);
  });
});
