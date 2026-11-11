import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { classifyEmotion } from '../src/core/emotion';
import { EMOTIONS } from '../src/types';

describe('classifyEmotion examples', () => {
  const cases: Array<[string, string]> = [
    ['我吓得尖叫，拼命逃跑', 'fear'],
    ['她在窗边哭了很久，满脸眼泪', 'sadness'],
    ['两个人大吵一架，有人愤怒地摔碎了盘子', 'anger'],
    ['墙里传来低语，影子自己动了', 'eerie'],
    ['这里很安静，让人安心', 'calm'],
    ['随便写点什么', 'eerie'],
    ['', 'eerie'],
  ];
  it.each(cases)('%s -> %s', (text, expected) => {
    expect(classifyEmotion(text)).toBe(expected);
  });

  const english: Array<[string, string]> = [
    ['I was terrified and screamed, then ran away', 'fear'],
    ['She cried by the window for hours, alone with her tears', 'sadness'],
    ['They fought and he smashed every plate in a rage', 'anger'],
    ['Whispers in the wall, and a shadow moved on its own', 'eerie'],
    ['It was quiet and peaceful, and I felt safe', 'calm'],
    ['Someone knocked at midnight and a shadow slid under the door', 'eerie'],
    ['I just checked in', 'eerie'],
  ];
  it.each(english)('English: %s -> %s', (text, expected) => {
    expect(classifyEmotion(text)).toBe(expected);
  });
  it('treats a negated English feeling as reassurance', () => {
    expect(classifyEmotion("I was not afraid at all")).toBe('calm');
  });
  it('treats a negated feeling as reassurance', () => {
    expect(classifyEmotion('我一点也不害怕')).toBe('calm');
  });

  it('breaks ties by fixed priority (fear before sadness)', () => {
    expect(classifyEmotion('害怕又难过')).toBe('fear');
  });
});

describe('classifyEmotion properties', () => {
  it('always returns a valid emotion', () => {
    fc.assert(
      fc.property(fc.string(), (s) => (EMOTIONS as readonly string[]).includes(classifyEmotion(s))),
    );
  });

  it('works on unicode and very long strings', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString({ maxLength: 5000 }), (s) => {
        expect(() => classifyEmotion(s)).not.toThrow();
      }),
    );
  });

  it('is deterministic', () => {
    fc.assert(fc.property(fc.string(), (s) => classifyEmotion(s) === classifyEmotion(s)));
  });

  it('ignores trailing whitespace', () => {
    fc.assert(
      fc.property(fc.string(), fc.stringOf(fc.constantFrom(' ', '\n', '\t')), (s, ws) => {
        expect(classifyEmotion(s + ws)).toBe(classifyEmotion(s));
      }),
    );
  });
});
