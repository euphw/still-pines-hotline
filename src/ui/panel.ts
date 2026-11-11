import { EMOTION_STYLE } from '../data/emotionStyle';
import { emotionLabel, t } from '../i18n';
import type { Lang, Message, Room } from '../types';
import { clear, el } from './dom';

export interface PanelOptions {
  room: Room | null;
  messages: Message[];
  lang: Lang;
}

export function messageText(m: Message, lang: Lang): string {
  return lang === 'en' && m.textEn ? m.textEn : m.text;
}

export function renderPanel(root: HTMLElement, opts: PanelOptions): void {
  clear(root);
  const { room, messages, lang } = opts;
  if (!room) {
    root.append(el('p', { class: 'hint' }, t(lang, 'selectRoom')));
    return;
  }

  root.append(
    el('h2', { class: 'room-title' }, room.name[lang]),
    el('p', { class: 'room-story-label' }, t(lang, 'roomStory')),
    el('p', { class: 'room-story' }, room.story[lang]),
    el('h3', {}, `${t(lang, 'messages')} (${messages.length})`),
  );

  if (messages.length === 0) {
    root.append(el('p', { class: 'empty' }, t(lang, 'noMessages')));
    return;
  }

  const list = el('ul', { class: 'message-list' });
  for (const m of messages) {
    const style = EMOTION_STYLE[m.emotion];
    const tag = el('span', { class: 'tag', style: `--c:${style.color}` }, `${style.glyph} ${emotionLabel(lang, m.emotion)}`);
    const li = el('li', { class: 'message', 'data-emotion': m.emotion }, tag, el('p', { class: 'bleed' }, messageText(m, lang)));
    list.append(li);
  }
  root.append(list);
}
