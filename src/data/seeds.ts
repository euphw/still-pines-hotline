import type { Message } from '../types';

const BASE = Date.UTC(2026, 9, 31, 22, 0, 0);
const MIN = 60_000;

/** Example messages shown on first launch and after "reset". */
export const SEED_MESSAGES: Message[] = [
  {
    id: 'seed-lobby-1', roomId: 'lobby', emotion: 'eerie', createdAt: BASE,
    text: '前台的铃自己响了三声，登记簿翻开到了新的一页，上面有我的名字。',
    textEn: 'The desk bell rang three times by itself. The guest book flipped open to a new page with my name on it.',
  },
  {
    id: 'seed-lobby-2', roomId: 'lobby', emotion: 'sadness', createdAt: BASE + 5 * MIN,
    text: '一位老先生每晚都坐在沙发上等人，等了很多年，再也没有人来接他。',
    textEn: 'An old man waits on the sofa every night. Years have passed and nobody has come for him.',
  },
  {
    id: 'seed-207-1', roomId: 'room207', emotion: 'fear', createdAt: BASE + 12 * MIN,
    text: '半夜有人敲门，我吓得不敢出声，门缝下面有影子慢慢走过去。',
    textEn: 'Someone knocked at midnight. I was too scared to answer, and a shadow slid slowly under the door.',
  },
  {
    id: 'seed-kitchen-1', roomId: 'kitchen', emotion: 'anger', createdAt: BASE + 20 * MIN,
    text: '我听见两个人在厨房里争吵，盘子被摔碎，有人吼着让对方滚出去。',
    textEn: 'Two voices argued in the kitchen. Plates were smashed and someone roared for the other to get out.',
  },
  {
    id: 'seed-ballroom-1', roomId: 'ballroom', emotion: 'calm', createdAt: BASE + 31 * MIN,
    text: '华尔兹很温柔，整个大厅意外地安宁，我站了很久，几乎想跟着跳起来。',
    textEn: 'The waltz was gentle and the hall oddly peaceful. I stood there a long while, almost wanting to dance.',
  },
  {
    id: 'seed-attic-1', roomId: 'attic', emotion: 'sadness', createdAt: BASE + 44 * MIN,
    text: '箱子里是一封没寄出的信，信纸上有泪痕，写信的人再也没有回来。',
    textEn: 'Inside the trunk was an unsent letter with tear stains. The writer never came back.',
  },
  {
    id: 'seed-basement-1', roomId: 'basement', emotion: 'fear', createdAt: BASE + 58 * MIN,
    text: '锅炉后面有东西在喘气，我转身就逃，一路上都觉得背后有人在追。',
    textEn: 'Something was panting behind the boiler. I ran, feeling someone chase me the whole way.',
  },
  {
    id: 'seed-well-1', roomId: 'well', emotion: 'eerie', createdAt: BASE + 70 * MIN,
    text: '井底传来低语，一遍一遍叫我的小名，可我从没告诉过任何人。',
    textEn: 'A whisper rose from the well, calling my childhood nickname over and over. I have never told anyone.',
  },
];
