import { describe, expect, it } from 'vitest';
import { MAP_HEIGHT, MAP_WIDTH, ROOMS } from '../src/data/rooms';
import { SEED_MESSAGES } from '../src/data/seeds';
import { DICTS } from '../src/i18n';
import { isValidMessage } from '../src/core/store';

describe('rooms', () => {
  it('has 7 rooms with unique ids', () => {
    expect(ROOMS).toHaveLength(7);
    expect(new Set(ROOMS.map((r) => r.id)).size).toBe(7);
  });

  it('has bilingual text and in-bounds rectangles', () => {
    for (const r of ROOMS) {
      expect(r.name.zh && r.name.en && r.story.zh && r.story.en).toBeTruthy();
      expect(r.rect.x).toBeGreaterThanOrEqual(0);
      expect(r.rect.y).toBeGreaterThanOrEqual(0);
      expect(r.rect.x + r.rect.w).toBeLessThanOrEqual(MAP_WIDTH);
      expect(r.rect.y + r.rect.h).toBeLessThanOrEqual(MAP_HEIGHT);
    }
  });

  it('has rooms that do not overlap', () => {
    for (let i = 0; i < ROOMS.length; i++) {
      for (let j = i + 1; j < ROOMS.length; j++) {
        const a = ROOMS[i].rect;
        const b = ROOMS[j].rect;
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap).toBe(false);
      }
    }
  });
});

describe('seeds', () => {
  it('are valid, unique, and cover every room', () => {
    expect(SEED_MESSAGES.every(isValidMessage)).toBe(true);
    expect(new Set(SEED_MESSAGES.map((m) => m.id)).size).toBe(SEED_MESSAGES.length);
    const covered = new Set(SEED_MESSAGES.map((m) => m.roomId));
    for (const r of ROOMS) expect(covered.has(r.id)).toBe(true);
  });
});

describe('i18n', () => {
  it('has the same keys in zh and en, none empty', () => {
    expect(Object.keys(DICTS.en).sort()).toEqual(Object.keys(DICTS.zh).sort());
    for (const lang of ['zh', 'en'] as const) {
      for (const v of Object.values(DICTS[lang])) expect(v.length).toBeGreaterThan(0);
    }
  });
});
