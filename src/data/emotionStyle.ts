import type { Emotion } from '../types';

/** Each emotion has a color AND a glyph so color is never the only cue. */
export const EMOTION_STYLE: Record<Emotion, { color: string; glyph: string }> = {
  fear: { color: '#e0524f', glyph: '▲' },
  sadness: { color: '#5b92e0', glyph: '●' },
  anger: { color: '#f0903a', glyph: '◆' },
  eerie: { color: '#a77be0', glyph: '✦' },
  calm: { color: '#5fbf94', glyph: '■' },
};
