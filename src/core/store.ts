import { EMOTIONS, type Emotion, type Message } from '../types';
import { ROOMS } from '../data/rooms';
import { SEED_MESSAGES } from '../data/seeds';

export const STORAGE_KEY = 'still-pines:v1';
export const MAX_TEXT_LENGTH = 300;

/** Subset of the Web Storage API we rely on (easy to fake in tests). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface Persisted {
  version: 1;
  messages: Message[];
}

const emotionSet = new Set<string>(EMOTIONS);
const roomSet = new Set(ROOMS.map((r) => r.id));

export function isValidMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.roomId === 'string' &&
    roomSet.has(m.roomId) &&
    typeof m.text === 'string' &&
    m.text.length > 0 &&
    m.text.length <= MAX_TEXT_LENGTH &&
    (m.textEn === undefined || (typeof m.textEn === 'string' && m.textEn.length <= MAX_TEXT_LENGTH * 2)) &&
    typeof m.emotion === 'string' &&
    emotionSet.has(m.emotion) &&
    typeof m.createdAt === 'number' &&
    Number.isFinite(m.createdAt)
  );
}

export function normalizeText(raw: string): string {
  return raw.trim().slice(0, MAX_TEXT_LENGTH);
}

function seeds(): Message[] {
  return SEED_MESSAGES.map((m) => ({ ...m }));
}

export class MessageStore {
  private messages: Message[];

  constructor(private storage: KeyValueStorage | null) {
    this.messages = this.load();
  }

  private load(): Message[] {
    if (!this.storage) return seeds();
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (raw === null) return seeds();
      const data = JSON.parse(raw) as Partial<Persisted>;
      if (data.version !== 1 || !Array.isArray(data.messages)) return seeds();
      return data.messages.filter(isValidMessage);
    } catch {
      return seeds();
    }
  }

  private save(): void {
    if (!this.storage) return;
    try {
      const data: Persisted = { version: 1, messages: this.messages };
      this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage may be full or blocked (private mode). Keep working in memory.
    }
  }

  all(): Message[] {
    return [...this.messages];
  }

  byRoom(roomId: string): Message[] {
    return this.messages
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Returns the saved message, or null when the input is not acceptable. */
  add(roomId: string, rawText: string, emotion: Emotion, now = Date.now()): Message | null {
    const text = normalizeText(rawText);
    if (!text || !roomSet.has(roomId) || !emotionSet.has(emotion)) return null;
    const message: Message = {
      id: `m-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      roomId,
      text,
      emotion,
      createdAt: now,
    };
    this.messages.push(message);
    this.save();
    return message;
  }

  clear(): void {
    this.messages = [];
    this.save();
  }

  reset(): void {
    this.messages = seeds();
    this.save();
  }
}

export function browserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
