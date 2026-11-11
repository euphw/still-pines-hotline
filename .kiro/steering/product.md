---
inclusion: always
---

# Still Pines Inn Hotline: product rules

- Frontend only: no backend, login, analytics, or external AI/API calls. Data lives in localStorage.
- No speech recognition or microphone access. The "REC" button is theatrical: animation, beep, then a text box.
- Emotions are exactly: fear, sadness, anger, eerie, calm. Unknown input defaults to eerie.
- Render user text with `textContent` only. Never use `innerHTML` with user data.
- Every new UI string goes into both `zh` and `en` in `src/i18n.ts`.
- Core logic (`src/core`) stays pure and DOM-free so it can be property-tested.
- Keep dependencies minimal; do not add a UI framework.
