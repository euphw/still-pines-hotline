import { classifyEmotion } from '../core/emotion';
import { MAX_TEXT_LENGTH, type MessageStore } from '../core/store';
import { EMOTION_STYLE } from '../data/emotionStyle';
import { emotionLabel, t } from '../i18n';
import type { Sfx } from '../audio/sfx';
import { EMOTIONS, type Emotion, type Lang, type Message } from '../types';
import { clear, el } from './dom';

type Phase = 'idle' | 'recording' | 'writing' | 'confirm';

export const RECORD_DELAY_MS = 1200;

export interface MachineDeps {
  store: MessageStore;
  sfx: Sfx;
  getLang: () => Lang;
  getRoomId: () => string | null;
  onSaved: (message: Message) => void;
}

/** The answering machine: record button, text entry, emotion confirmation. */
export class Machine {
  phase: Phase = 'idle';
  draft = '';
  emotion: Emotion = 'eerie';
  error = '';
  status = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private root: HTMLElement, private deps: MachineDeps) {
    this.render();
  }

  /** Called when the selected room or language changes. */
  reset(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.phase = 'idle';
    this.draft = '';
    this.error = '';
    this.status = '';
    this.render();
  }

  refresh(): void {
    this.render();
  }

  startRecording(): void {
    if (this.phase !== 'idle' || !this.deps.getRoomId()) return;
    this.status = '';
    this.phase = 'recording';
    this.deps.sfx.click();
    this.render();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.deps.sfx.beep();
      this.phase = 'writing';
      this.render();
      this.root.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    }, RECORD_DELAY_MS);
  }

  submit(): void {
    if (this.phase !== 'writing') return;
    if (this.draft.trim().length === 0) {
      this.error = 'emptyError';
      this.render();
      return;
    }
    this.error = '';
    this.emotion = classifyEmotion(this.draft);
    this.phase = 'confirm';
    this.render();
  }

  chooseEmotion(e: Emotion): void {
    if (this.phase !== 'confirm') return;
    this.emotion = e;
    this.render();
  }

  save(): void {
    const roomId = this.deps.getRoomId();
    if (this.phase !== 'confirm' || !roomId) return;
    const saved = this.deps.store.add(roomId, this.draft, this.emotion);
    if (!saved) return;
    this.deps.sfx.chime();
    this.phase = 'idle';
    this.draft = '';
    this.status = 'saved';
    this.render();
    this.deps.onSaved(saved);
  }

  cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.phase = 'idle';
    this.draft = '';
    this.error = '';
    this.render();
  }

  private render(): void {
    const lang = this.deps.getLang();
    const hasRoom = this.deps.getRoomId() !== null;
    clear(this.root);

    const reels = el('div', { class: `reels${this.phase === 'recording' ? ' spinning' : ''}`, 'aria-hidden': 'true' },
      el('span', { class: 'reel' }), el('span', { class: 'reel' }));
    const light = el('span', { class: `rec-light${this.phase === 'recording' ? ' on' : ''}`, 'aria-hidden': 'true' });
    this.root.append(el('div', { class: 'deck' }, light, reels));

    if (this.phase === 'idle') {
      const btn = el('button', { type: 'button', class: 'btn rec', disabled: !hasRoom }, t(lang, 'recordBtn'));
      btn.addEventListener('click', () => this.startRecording());
      this.root.append(btn);
      if (!hasRoom) this.root.append(el('p', { class: 'hint' }, t(lang, 'recordHint')));
      if (this.status === 'saved') {
        this.root.append(el('p', { class: 'status', role: 'status' }, t(lang, 'saved')));
      }
    } else if (this.phase === 'recording') {
      this.root.append(el('p', { class: 'status', role: 'status' }, t(lang, 'recording')));
    } else if (this.phase === 'writing') {
      const label = el('label', { for: 'msg-text' }, t(lang, 'textLabel'));
      const ta = el('textarea', {
        id: 'msg-text',
        maxlength: MAX_TEXT_LENGTH,
        rows: 4,
        placeholder: t(lang, 'textPlaceholder'),
      });
      ta.value = this.draft;
      const counter = el('span', { class: 'counter' }, t(lang, 'charCount', { n: this.draft.length, max: MAX_TEXT_LENGTH }));
      ta.addEventListener('input', () => {
        this.draft = ta.value;
        counter.textContent = t(lang, 'charCount', { n: this.draft.length, max: MAX_TEXT_LENGTH });
      });
      const submit = el('button', { type: 'button', class: 'btn primary' }, t(lang, 'submit'));
      submit.addEventListener('click', () => this.submit());
      const cancel = el('button', { type: 'button', class: 'btn' }, t(lang, 'cancel'));
      cancel.addEventListener('click', () => this.cancel());
      this.root.append(label, ta, counter);
      if (this.error) this.root.append(el('p', { class: 'error', role: 'alert' }, t(lang, 'emptyError')));
      this.root.append(el('div', { class: 'row' }, submit, cancel));
    } else {
      this.root.append(
        el('p', { class: 'confirm-text' }, t(lang, 'confirmEmotion', { emotion: emotionLabel(lang, this.emotion) })),
      );
      const group = el('div', { class: 'emotions', role: 'radiogroup' });
      for (const e of EMOTIONS) {
        const style = EMOTION_STYLE[e];
        const b = el('button', {
          type: 'button',
          class: `emotion-btn${e === this.emotion ? ' active' : ''}`,
          role: 'radio',
          'aria-checked': e === this.emotion,
          'data-emotion': e,
          style: `--c:${style.color}`,
        }, `${style.glyph} ${emotionLabel(lang, e)}`);
        b.addEventListener('click', () => this.chooseEmotion(e));
        group.append(b);
      }
      const save = el('button', { type: 'button', class: 'btn primary' }, t(lang, 'save'));
      save.addEventListener('click', () => this.save());
      const cancel = el('button', { type: 'button', class: 'btn' }, t(lang, 'cancel'));
      cancel.addEventListener('click', () => this.cancel());
      this.root.append(group, el('div', { class: 'row' }, save, cancel));
    }
  }
}
