import type { Room } from '../types';

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;

export const ROOMS: Room[] = [
  {
    id: 'attic',
    name: { zh: '阁楼', en: 'Attic' },
    story: {
      zh: '尘土里躺着一只上了锁的旧箱子。没有人记得钥匙在哪，可锁孔里偶尔会有光。',
      en: 'A locked trunk lies in the dust. Nobody remembers where the key went, yet light sometimes leaks from the keyhole.',
    },
    rect: { x: 40, y: 40, w: 200, h: 160 },
  },
  {
    id: 'ballroom',
    name: { zh: '宴会厅', en: 'Ballroom' },
    story: {
      zh: '大厅早已空无一人，华尔兹却每晚准时响起，地板上有跳舞的脚印。',
      en: 'The hall has been empty for years, but a waltz starts every night on time. Dancing footprints mark the floor.',
    },
    rect: { x: 260, y: 40, w: 300, h: 160 },
  },
  {
    id: 'room207',
    name: { zh: '207 号房', en: 'Room 207' },
    story: {
      zh: '门牌总被人换成别的数字。住过的客人说，半夜有人在门外轻轻数着房间号。',
      en: 'The door number keeps getting swapped for another. Guests say someone outside whispers room numbers at midnight.',
    },
    rect: { x: 580, y: 40, w: 180, h: 160 },
  },
  {
    id: 'kitchen',
    name: { zh: '厨房', en: 'Kitchen' },
    story: {
      zh: '深夜里有人在切菜，案板上却什么也没有。炉火从来不是自己点着的。',
      en: 'Someone chops vegetables deep at night, yet the board is bare. The stove never lights itself.',
    },
    rect: { x: 40, y: 220, w: 200, h: 160 },
  },
  {
    id: 'lobby',
    name: { zh: '大堂', en: 'Lobby' },
    story: {
      zh: '前台的铃一直在响。登记簿上最后一个名字，墨迹还是湿的。',
      en: 'The front desk bell never stops. The last name in the guest book is still wet with ink.',
    },
    rect: { x: 260, y: 220, w: 300, h: 160 },
  },
  {
    id: 'well',
    name: { zh: '后院水井', en: 'Backyard Well' },
    story: {
      zh: '有人在井边听见井底喊自己的名字。绳子放下去，总是比昨天长一截。',
      en: 'Visitors hear their own name called from the bottom. The rope always runs a little longer than yesterday.',
    },
    rect: { x: 580, y: 220, w: 180, h: 160 },
  },
  {
    id: 'basement',
    name: { zh: '地下室', en: 'Basement' },
    story: {
      zh: '锅炉的声音像有人在呼吸，一吸一呼，和你的节奏慢慢同步。',
      en: 'The boiler sounds like breathing. In, out, slowly falling into step with your own.',
    },
    rect: { x: 260, y: 400, w: 300, h: 160 },
  },
];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}
