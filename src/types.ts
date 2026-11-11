export const EMOTIONS = ['fear', 'sadness', 'anger', 'eerie', 'calm'] as const;
export type Emotion = (typeof EMOTIONS)[number];

export type Lang = 'zh' | 'en';

export interface Bilingual {
  zh: string;
  en: string;
}

export interface Room {
  id: string;
  name: Bilingual;
  story: Bilingual;
  /** Rectangle on the 800x600 map viewBox. */
  rect: { x: number; y: number; w: number; h: number };
}

export interface Message {
  id: string;
  roomId: string;
  text: string;
  /** Optional English version, used by seed messages. */
  textEn?: string;
  emotion: Emotion;
  createdAt: number;
}

export interface Marker {
  roomId: string;
  emotion: Emotion;
  count: number;
}
