import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sfx } from '../src/audio/sfx';
import { RECORD_DELAY_MS } from '../src/ui/machine';
import { App } from '../src/ui/app';
import type { KeyValueStorage } from '../src/core/store';

class FakeStorage implements KeyValueStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

let root: HTMLElement;
let app: App;

function q<T extends Element>(sel: string): T {
  const node = root.querySelector<T>(sel);
  if (!node) throw new Error(`missing ${sel}`);
  return node;
}
function click(sel: string) {
  q<HTMLElement>(sel).dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
  localStorage.clear();
  app = new App(root, { storage: new FakeStorage(), sfx: new Sfx() });
  app.setLang('zh');
});
afterEach(() => vi.useRealTimers());

describe('panel', () => {
  it('shows each room with its own messages', () => {
    click('[data-room="lobby"]');
    expect(root.querySelectorAll('.message')).toHaveLength(2);
    click('[data-room="kitchen"]');
    expect(root.querySelectorAll('.message')).toHaveLength(1);
    expect(root.querySelector('.room-title')!.textContent).toBe('厨房');
  });

  it('shows an empty state for a room without messages', () => {
    app.store.clear();
    click('[data-room="well"]');
    expect(root.querySelector('.empty')).not.toBeNull();
  });

  it('renders message text as plain text', () => {
    app.store.add('well', '<img src=x onerror=alert(1)>', 'eerie');
    click('[data-room="well"]');
    expect(root.querySelector('.message-list img')).toBeNull();
  });
});

describe('answering machine flow', () => {
  function openWriting() {
    click('[data-room="well"]');
    click('.btn.rec');
    vi.advanceTimersByTime(RECORD_DELAY_MS + 10);
  }

  it('disables recording until a room is chosen', () => {
    expect(q<HTMLButtonElement>('.btn.rec').disabled).toBe(true);
  });

  it('blocks empty submissions', () => {
    openWriting();
    click('.row .btn.primary');
    expect(root.querySelector('.error')).not.toBeNull();
    expect(root.querySelector('.emotions')).toBeNull();
  });

  it('saves with the emotion the user picked and updates list and map', () => {
    openWriting();
    const ta = q<HTMLTextAreaElement>('textarea');
    ta.value = '井边传来低语';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    click('.row .btn.primary');
    expect(q<HTMLElement>('.emotion-btn.active').dataset.emotion).toBe('eerie');
    click('[data-emotion="sadness"].emotion-btn');
    click('.row .btn.primary');

    const first = q<HTMLElement>('.message');
    expect(first.dataset.emotion).toBe('sadness');
    expect(first.textContent).toContain('井边传来低语');
    expect(root.querySelector('[data-room="well"] .marker[data-emotion="sadness"]')).not.toBeNull();
    expect(root.querySelector('.status')).not.toBeNull();
  });
});

describe('language', () => {
  it('switches UI text and English sample messages', () => {
    click('[data-room="lobby"]');
    app.setLang('en');
    expect(q('.room-title').textContent).toBe('Lobby');
    expect(root.textContent).toContain('The desk bell rang');
    app.setLang('zh');
    expect(q('.room-title').textContent).toBe('大堂');
  });
});

describe('sfx', () => {
  it('is a safe no-op without WebAudio', () => {
    const sfx = new Sfx();
    expect(() => {
      sfx.setEnabled(true);
      sfx.beep();
      sfx.click();
      sfx.chime();
      sfx.setEnabled(false);
    }).not.toThrow();
    expect(sfx.enabled).toBe(false);
  });
});
