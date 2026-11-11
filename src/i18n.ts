import type { Emotion, Lang } from './types';

const zh = {
  title: '静林旅馆 · 留言答录机',
  subtitle: '选一个房间，告诉我们这里发生过什么。',
  mapLabel: '静林旅馆平面图',
  selectRoom: '点击地图上的一个房间',
  roomStory: '房间传闻',
  messages: '留言',
  noMessages: '这里还没有人留下声音……你愿意做第一个吗？',
  recordBtn: '● 录音',
  recording: '录音中……请在哔声后留言',
  recordHint: '请先在地图上选择房间',
  textLabel: '这里发生过什么？',
  textPlaceholder: '例如：半夜有人在门外低语……',
  charCount: '{n}/{max}',
  submit: '提交留言',
  emptyError: '请先写下一些内容。',
  confirmEmotion: '我们听出的情绪是「{emotion}」，不对的话可以改：',
  save: '保存到地图',
  cancel: '取消',
  saved: '留言已存入磁带。',
  soundOn: '音效：开',
  soundOff: '音效：关',
  langSwitch: 'English',
  resetBtn: '重置示例',
  clearBtn: '清空留言',
  confirmClear: '确定要清空所有留言吗？',
  confirmReset: '确定要恢复示例留言吗？现有留言会被替换。',
  legend: '情绪图例',
  count: '{n} 条',
  fear: '恐惧',
  sadness: '悲伤',
  anger: '愤怒',
  eerie: '诡异',
  calm: '平静',
  close: '关闭',
  footer: '全部数据只保存在你的浏览器里。',
};

export type Key = keyof typeof zh;

const en: Record<Key, string> = {
  title: 'Still Pines Inn · Hotline',
  subtitle: 'Pick a room and tell us what happened here.',
  mapLabel: 'Still Pines Inn floor plan',
  selectRoom: 'Tap a room on the map',
  roomStory: 'Rumor',
  messages: 'Messages',
  noMessages: 'Nobody has left a voice here yet… will you be the first?',
  recordBtn: '● REC',
  recording: 'Recording… speak after the beep',
  recordHint: 'Choose a room on the map first',
  textLabel: 'What happened here?',
  textPlaceholder: 'e.g. Someone whispered outside the door at midnight…',
  charCount: '{n}/{max}',
  submit: 'Submit message',
  emptyError: 'Please write something first.',
  confirmEmotion: 'We heard “{emotion}”. Change it if that is wrong:',
  save: 'Save to map',
  cancel: 'Cancel',
  saved: 'Message saved to the tape.',
  soundOn: 'Sound: on',
  soundOff: 'Sound: off',
  langSwitch: '中文',
  resetBtn: 'Reset samples',
  clearBtn: 'Clear messages',
  confirmClear: 'Clear all messages?',
  confirmReset: 'Restore sample messages? Current messages will be replaced.',
  legend: 'Emotion legend',
  count: '{n}',
  fear: 'Fear',
  sadness: 'Sadness',
  anger: 'Anger',
  eerie: 'Eerie',
  calm: 'Calm',
  close: 'Close',
  footer: 'All data stays in your browser.',
};

export const DICTS: Record<Lang, Record<Key, string>> = { zh, en };

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  let s = DICTS[lang][key];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function emotionLabel(lang: Lang, e: Emotion): string {
  return t(lang, e);
}

/** English is the default; a language the visitor picked earlier is restored by the app. */
export function detectLang(): Lang {
  return 'en';
}
