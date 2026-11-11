# Still Pines Inn Hotline

Kiroween 2026 entry, **Costume Contest** category.

Pick a room in an abandoned hotel, press REC on an old answering machine, and leave a note about what happened there. The app tags the note with an emotion (fear, sadness, anger, eerie, calm) and drops a marker on the hotel map. Works on phones and desktop browsers. No login, no backend, no external AI. Everything stays in your browser's localStorage.


## Features
- SVG floor plan with 7 rooms; mouse, touch and keyboard friendly
- Answering machine flow: REC (reels, light, beep) -> text -> confirm emotion -> save
- Keyword emotion classifier for English and Chinese text (handles simple negation); you can override the suggestion
- Map markers combine color and glyph, with counts
- English UI by default, with a Chinese / English switch; sample messages in both languages
- Synthesized WebAudio sounds (off by default), reduced-motion support
- Sample data on first launch; Reset and Clear buttons

Voice is intentionally not used: the REC button is theatrical, and no microphone or speech API is touched.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit + property-based tests
npm run build    # static output in dist/
```

## Deploy (GitHub Pages)
Push to `main`. `.github/workflows/deploy.yml` builds and publishes `dist/`. In the repo settings, set Pages source to "GitHub Actions".

## How Kiro was used
- **Spec-driven development**: `.kiro/specs/still-pines-hotline/` holds requirements, design and tasks. The design lists the correctness properties that became tests.
- **Steering**: `.kiro/steering/product.md` (hard constraints: frontend only, no speech API, `textContent` only, bilingual strings) and `visual-style.md` (palette, motifs, accessibility).
- **Hooks**: `.kiro/hooks/typecheck-and-test-on-save.json` runs type check and tests when a `.ts` or `.css` file is saved.
- **Property-based testing** (fast-check): the classifier always returns a valid emotion, is deterministic and ignores trailing whitespace; store round trips; corrupted storage never throws; marker counts always sum to the message count.

## Project layout
```
src/core      pure logic (emotion classifier, markers, store)
src/data      rooms, sample messages, emotion styles
src/ui        map, panel, answering machine, app wiring
src/audio     WebAudio effects
tests         Vitest + fast-check
.kiro         specs, steering, hooks
```

## License
MIT
