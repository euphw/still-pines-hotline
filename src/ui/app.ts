import { Sfx } from '../audio/sfx';
import { computeMarkers } from '../core/markers';
import { MessageStore, browserStorage, type KeyValueStorage } from '../core/store';
import { EMOTION_STYLE } from '../data/emotionStyle';
import { ROOMS, getRoom } from '../data/rooms';
import { detectLang, emotionLabel, t } from '../i18n';
import { EMOTIONS, type Lang, type Message } from '../types';
import { clear, el } from './dom';
import { Machine } from './machine';
import { createMapSvg, renderMap } from './map';
import { renderPanel } from './panel';

const LANG_KEY = 'still-pines:lang';

export interface AppOptions {
  storage?: KeyValueStorage | null;
  sfx?: Sfx;
}

export class App {
  lang: Lang;
  selectedId: string | null = null;
  private fresh: { roomId: string; emotion: string } | null = null;
  readonly store: MessageStore;
  private sfx: Sfx;
  private storage: KeyValueStorage | null;

  private mapSvg = createMapSvg();
  private header = el('header', { class: 'top' });
  private legend = el('ul', { class: 'legend' });
  private aside = el('aside', { class: 'sheet', 'aria-live': 'polite' });
  private panelBox = el('div', { class: 'panel' });
  private machineBox = el('div', { class: 'machine' });
  private closeBtn = el('button', { type: 'button', class: 'btn close-sheet' });
  private footer = el('footer', { class: 'foot' });
  private machine: Machine;

  constructor(private root: HTMLElement, options: AppOptions = {}) {
    this.storage = options.storage === undefined ? browserStorage() : options.storage;
    this.store = new MessageStore(this.storage);
    this.sfx = options.sfx ?? new Sfx();
    this.lang = this.loadLang();

    this.closeBtn.addEventListener('click', () => this.select(null));
    this.aside.append(this.closeBtn, this.panelBox, this.machineBox);

    const main = el('main', { class: 'layout' }, el('section', { class: 'map-wrap' }, this.mapSvg, this.legend), this.aside);
    this.root.append(this.header, main, this.footer);

    this.machine = new Machine(this.machineBox, {
      store: this.store,
      sfx: this.sfx,
      getLang: () => this.lang,
      getRoomId: () => this.selectedId,
      onSaved: (m: Message) => {
        this.fresh = { roomId: m.roomId, emotion: m.emotion };
        this.renderMapAndPanel();
      },
    });
    this.renderAll();
  }

  private loadLang(): Lang {
    try {
      const saved = this.storage?.getItem(LANG_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return detectLang();
  }

  select(roomId: string | null): void {
    this.selectedId = roomId;
    this.fresh = null;
    this.machine.reset();
    this.renderMapAndPanel();
    this.aside.classList.toggle('open', roomId !== null);
  }

  setLang(lang: Lang): void {
    this.lang = lang;
    try {
      this.storage?.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    this.renderAll();
  }

  private renderMapAndPanel(): void {
    renderMap(this.mapSvg, {
      rooms: ROOMS,
      markers: computeMarkers(this.store.all(), ROOMS),
      selectedId: this.selectedId,
      lang: this.lang,
      fresh: this.fresh,
      onSelect: (id) => this.select(id),
    });
    const room = this.selectedId ? getRoom(this.selectedId) ?? null : null;
    renderPanel(this.panelBox, {
      room,
      messages: room ? this.store.byRoom(room.id) : [],
      lang: this.lang,
    });
  }

  private renderHeader(): void {
    clear(this.header);
    const lang = this.lang;

    const sound = el('button', { type: 'button', class: 'btn', 'aria-pressed': this.sfx.enabled },
      t(lang, this.sfx.enabled ? 'soundOn' : 'soundOff'));
    sound.disabled = !this.sfx.supported;
    sound.addEventListener('click', () => {
      this.sfx.setEnabled(!this.sfx.enabled);
      this.renderHeader();
    });

    const langBtn = el('button', { type: 'button', class: 'btn' }, t(lang, 'langSwitch'));
    langBtn.addEventListener('click', () => this.setLang(lang === 'zh' ? 'en' : 'zh'));

    const resetBtn = el('button', { type: 'button', class: 'btn' }, t(lang, 'resetBtn'));
    resetBtn.addEventListener('click', () => {
      if (window.confirm(t(this.lang, 'confirmReset'))) {
        this.store.reset();
        this.renderMapAndPanel();
      }
    });
    const clearBtn = el('button', { type: 'button', class: 'btn' }, t(lang, 'clearBtn'));
    clearBtn.addEventListener('click', () => {
      if (window.confirm(t(this.lang, 'confirmClear'))) {
        this.store.clear();
        this.renderMapAndPanel();
      }
    });

    this.header.append(
      el('div', { class: 'brand' }, el('h1', {}, t(lang, 'title')), el('p', {}, t(lang, 'subtitle'))),
      el('div', { class: 'controls' }, sound, langBtn, resetBtn, clearBtn),
    );
  }

  private renderLegend(): void {
    clear(this.legend);
    this.legend.setAttribute('aria-label', t(this.lang, 'legend'));
    for (const e of EMOTIONS) {
      const s = EMOTION_STYLE[e];
      this.legend.append(el('li', { style: `--c:${s.color}` }, `${s.glyph} ${emotionLabel(this.lang, e)}`));
    }
  }

  renderAll(): void {
    document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t(this.lang, 'title');
    this.renderHeader();
    this.renderLegend();
    this.closeBtn.textContent = t(this.lang, 'close');
    this.footer.textContent = t(this.lang, 'footer');
    this.renderMapAndPanel();
    this.machine.refresh();
  }
}
