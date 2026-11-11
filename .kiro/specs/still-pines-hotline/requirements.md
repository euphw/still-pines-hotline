# Requirements: Still Pines Inn Hotline

A single-page web app (phone and desktop). Visitors pick a room of a haunted hotel, leave a short text message about what happened there on an answering machine, and see the message appear on the hotel map with an emotion marker. No login, backend, or external AI.

## 1. Map and rooms
1.1 The app shows an SVG floor plan with 7 preset rooms (Lobby, Room 207, Kitchen, Ballroom, Attic, Basement, Backyard Well).
1.2 Each room can be selected by pointer, touch, or keyboard (Enter/Space) and shows a selected state.
1.3 Each room has a bilingual name and a short rumor text.

## 2. Leaving a message
2.1 A room must be selected before recording can start.
2.2 Pressing REC plays a short answering machine animation and beep, then reveals a text box. No microphone or speech API is used.
2.3 Empty or whitespace-only messages cannot be submitted.
2.4 Messages are limited to 300 characters.

## 3. Emotion labelling
3.1 Supported emotions: fear, sadness, anger, eerie, calm.
3.2 A keyword classifier suggests an emotion from English or Chinese text, handling simple negation ("not afraid", "不害怕").
3.3 With no keyword match the suggestion is eerie.
3.4 The user can change the suggested emotion before saving; the saved value is the user's choice.
3.5 The classifier is deterministic and never throws, for any input.

## 4. Showing messages
4.1 The side panel (bottom sheet on phones) lists the room's messages, newest first, with an emotion tag.
4.2 The map shows one marker per (room, emotion) with a count. Markers use color and a distinct glyph.
4.3 The sum of marker counts equals the number of stored messages.
4.4 Message text is rendered as plain text only.

## 5. Data
5.1 Messages are stored in localStorage and survive reload.
5.2 First launch (and Reset) loads sample messages covering every room.
5.3 Clear removes all messages. Corrupt or invalid stored data never crashes the app.
5.4 If storage is unavailable the app still works in memory.

## 6. Language, sound, accessibility
6.1 The UI is available in English and Chinese. English is the default; a language the visitor picks is remembered. Sample messages exist in both languages.
6.2 Sound effects are synthesized with WebAudio, off by default, with a toggle; the app works without audio support.
6.3 `prefers-reduced-motion` disables animations without losing function.
6.4 Touch targets are at least 44px.

## 7. Delivery
7.1 Static build deployable to GitHub Pages. MIT license. `.kiro` directory is committed.
