import { MAP_HEIGHT, MAP_WIDTH } from '../data/rooms';
import { EMOTION_STYLE } from '../data/emotionStyle';
import { emotionLabel, t } from '../i18n';
import type { Lang, Marker, Room } from '../types';
import { clear, svg } from './dom';

export interface MapOptions {
  rooms: Room[];
  markers: Marker[];
  selectedId: string | null;
  lang: Lang;
  /** Marker that was just added, for the pop-in animation. */
  fresh: { roomId: string; emotion: string } | null;
  onSelect: (roomId: string) => void;
}

const MARKER_SPACING = 44;

export function createMapSvg(): SVGSVGElement {
  return svg('svg', {
    viewBox: `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`,
    class: 'map',
    role: 'group',
    preserveAspectRatio: 'xMidYMid meet',
  });
}

export function renderMap(root: SVGSVGElement, opts: MapOptions): void {
  clear(root);
  root.setAttribute('aria-label', t(opts.lang, 'mapLabel'));

  // Corridor and outer wall give the plan some character.
  root.append(
    svg('rect', { x: 20, y: 20, width: MAP_WIDTH - 40, height: MAP_HEIGHT - 40, class: 'map-wall', rx: 6 }),
  );

  for (const room of opts.rooms) {
    const roomMarkers = opts.markers.filter((m) => m.roomId === room.id);
    const total = roomMarkers.reduce((s, m) => s + m.count, 0);
    const name = room.name[opts.lang];
    const label = `${name}, ${t(opts.lang, 'messages')}: ${total}`;
    const selected = room.id === opts.selectedId;

    const g = svg('g', {
      class: `room${selected ? ' selected' : ''}`,
      tabindex: 0,
      role: 'button',
      'aria-label': label,
      'aria-pressed': selected,
      'data-room': room.id,
    });
    const activate = () => opts.onSelect(room.id);
    g.addEventListener('click', activate);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });

    const { x, y, w, h } = room.rect;
    g.append(svg('rect', { x, y, width: w, height: h, class: 'room-rect', rx: 4 }));
    const title = svg('text', { x: x + 14, y: y + 30, class: 'room-name' });
    title.textContent = name;
    g.append(title);

    roomMarkers.forEach((m, i) => {
      const cx = x + 30 + i * MARKER_SPACING;
      const cy = y + h - 34;
      const style = EMOTION_STYLE[m.emotion];
      const isFresh = opts.fresh?.roomId === m.roomId && opts.fresh.emotion === m.emotion;
      const mg = svg('g', {
        class: `marker${isFresh ? ' pop' : ''}`,
        'data-emotion': m.emotion,
        transform: `translate(${cx} ${cy})`,
      });
      const tip = svg('title');
      tip.textContent = `${emotionLabel(opts.lang, m.emotion)} · ${t(opts.lang, 'count', { n: m.count })}`;
      mg.append(
        tip,
        svg('circle', { r: 17, fill: style.color, class: 'marker-dot' }),
      );
      const glyph = svg('text', { class: 'marker-glyph', 'text-anchor': 'middle', y: 6 });
      glyph.textContent = style.glyph;
      mg.append(glyph);
      if (m.count > 1) {
        const badge = svg('text', { class: 'marker-count', x: 14, y: -10, 'text-anchor': 'middle' });
        badge.textContent = String(m.count);
        mg.append(badge);
      }
      g.append(mg);
    });

    root.append(g);
  }
}
