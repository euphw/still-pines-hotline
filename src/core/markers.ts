import { EMOTIONS, type Marker, type Message, type Room } from '../types';

/** Groups messages into one marker per (room, emotion) with a count. */
export function computeMarkers(messages: Message[], rooms: Room[]): Marker[] {
  const roomIds = new Set(rooms.map((r) => r.id));
  const counts = new Map<string, number>();
  for (const m of messages) {
    if (!roomIds.has(m.roomId)) continue;
    const key = `${m.roomId}|${m.emotion}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const markers: Marker[] = [];
  for (const room of rooms) {
    for (const emotion of EMOTIONS) {
      const count = counts.get(`${room.id}|${emotion}`) ?? 0;
      if (count > 0) markers.push({ roomId: room.id, emotion, count });
    }
  }
  return markers;
}
