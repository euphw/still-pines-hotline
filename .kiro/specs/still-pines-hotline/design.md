# Design: Still Pines Inn Hotline

## Stack
Vite + TypeScript, no UI framework. Vitest + jsdom for tests, fast-check for property-based tests.

## Data flow
Map click -> select room -> panel + machine -> text -> classifier -> user confirms emotion -> store -> map and panel re-render.

## Modules
| Module | Role |
|---|---|
| `src/data/rooms.ts` | Room definitions and rectangles on an 800x600 viewBox |
| `src/data/seeds.ts` | Sample messages (zh + en) |
| `src/core/emotion.ts` | Pure keyword classifier with weights, negation, fixed tie priority |
| `src/core/markers.ts` | Messages -> one marker per (room, emotion) |
| `src/core/store.ts` | localStorage-backed store, validation, versioned key |
| `src/audio/sfx.ts` | WebAudio beep/click/chime/ambient hum, safe no-op |
| `src/ui/*` | `map` (SVG), `panel`, `machine` (state machine), `app` (wiring) |
| `src/i18n.ts` | zh/en dictionaries, typed so both languages share keys |

## Machine states
`idle -> recording (1.2s) -> writing -> confirm -> idle`. Cancel returns to idle. Changing room resets the machine.

## Correctness properties (tested with fast-check)
- P1: `classifyEmotion(s)` returns a valid emotion for any string.
- P2: `classifyEmotion` is deterministic and ignores trailing whitespace.
- P3: write then read through a new store returns an equal message.
- P4: corrupted storage content never throws.
- P5: sum of marker counts equals the number of messages in known rooms.

## Safety
All user text goes through `textContent`, never `innerHTML`. Stored entries are validated on load.

## Accessibility
Rooms are focusable buttons with labels. Markers add glyphs to color. Reduced motion disables animation.
