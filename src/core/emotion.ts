import { EMOTIONS, type Emotion } from '../types';

/** Tie-break order when two emotions score the same. */
const PRIORITY: Emotion[] = ['fear', 'anger', 'sadness', 'eerie', 'calm'];

export const DEFAULT_EMOTION: Emotion = 'eerie';

const LEXICON: Record<Emotion, Array<[string, number]>> = {
  fear: [
    ['害怕', 2], ['恐惧', 3], ['恐怖', 2], ['惊恐', 3], ['尖叫', 3], ['吓', 2],
    ['颤抖', 2], ['发抖', 2], ['毛骨悚然', 3], ['心跳', 1], ['逃', 2], ['惊慌', 2],
    ['血', 2], ['死', 2], ['冷汗', 2], ['背后', 1], ['追', 1],
  ],
  sadness: [
    ['悲伤', 3], ['难过', 2], ['哭', 3], ['眼泪', 2], ['泪', 2], ['孤独', 2],
    ['孤单', 2], ['思念', 2], ['想念', 2], ['遗憾', 2], ['失去', 2], ['等待', 1],
    ['再也', 1], ['告别', 2], ['离开', 1], ['叹息', 2],
  ],
  anger: [
    ['愤怒', 3], ['生气', 2], ['怒', 3], ['咒骂', 3], ['吼', 2], ['砸', 2],
    ['摔', 2], ['恨', 3], ['争吵', 2], ['吵架', 2], ['报复', 3], ['复仇', 3],
  ],
  eerie: [
    ['诡异', 3], ['奇怪', 1], ['怪异', 2], ['低语', 2], ['耳语', 2], ['影子', 2],
    ['幽灵', 2], ['鬼', 2], ['阴影', 2], ['脚步声', 2], ['敲门', 2], ['回声', 1],
    ['自己动', 2], ['凭空', 2], ['消失', 2], ['出现', 1], ['闪烁', 2], ['雾', 1],
  ],
  calm: [
    ['平静', 3], ['安静', 2], ['安宁', 3], ['温柔', 2], ['温暖', 2], ['安心', 3],
    ['放松', 2], ['宁静', 3], ['舒服', 1], ['微笑', 2], ['轻轻', 1], ['摇篮', 2],
  ],
};

const NEGATIONS = ['不', '没', '没有', '别', '未', '无'];

/** True when a negation word sits within 2 characters before `index`. */
function isNegated(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 2), index);
  return NEGATIONS.some((n) => before.includes(n));
}

export function scoreEmotions(text: string): Record<Emotion, number> {
  const scores = Object.fromEntries(EMOTIONS.map((e) => [e, 0])) as Record<Emotion, number>;
  for (const emotion of EMOTIONS) {
    for (const [word, weight] of LEXICON[emotion]) {
      let from = 0;
      for (;;) {
        const idx = text.indexOf(word, from);
        if (idx === -1) break;
        if (isNegated(text, idx)) {
          // "不害怕" reads as reassurance, not as the negated feeling.
          if (emotion !== 'calm') scores.calm += 1;
        } else {
          scores[emotion] += weight;
        }
        from = idx + word.length;
      }
    }
  }
  return scores;
}

/** Pure, deterministic classifier. Always returns a valid emotion. */
export function classifyEmotion(text: string): Emotion {
  const scores = scoreEmotions(text);
  let best: Emotion = DEFAULT_EMOTION;
  let bestScore = 0;
  for (const emotion of PRIORITY) {
    if (scores[emotion] > bestScore) {
      best = emotion;
      bestScore = scores[emotion];
    }
  }
  return best;
}
