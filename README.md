# A room of my own

An illustrated portfolio environment: a lounging developer, a sleeping orange
cat, a warm lamp, and a room full of objects that can become stories later.

## Open it

Open **`dist/preview.html`** directly in a browser. It includes the artwork and
the same animation code as the website, and works without a server.

To rebuild after editing (Node 20+):

```sh
npm run build
```

For a local web server (Python 3 required):

```sh
npm run dev
```

Visit `http://127.0.0.1:4173`. This command builds once; rebuild and refresh after
changes. `npm run preview -- --port 4174` selects another preview port.
The server serves only `dist/`.

## Current scene

- The expanded illustration fills the viewport without borders or page sections.
- Click the loose page at the lower-right of the pinboard to read **My story**.
  His foot moves, sparkles travel to the nail, then the nail releases and
  the paper floats into the center. Close with Escape, the × button, or the
  dimmed room. Closing during flight reverses from the current position.
- Click the cat, guitar, or laptop to open their sections. His foot sends a
  sparkle cue to the object before it comes forward. The laptop turns its
  screen toward you and expands across the viewport. Each section closes with
  Escape, the × button, or the dimmed room.
- The midpoint between the eyes is the gaze baseline. Each eye aims toward the
  pointer from its own position, including when the pointer sits between them.
  Screen center correctly means looking left from this off-center face.
  At the far edges, a small
  neck/head turn follows them; the character blinks occasionally.
- The cat breathes and occasionally twitches its tail. Opening its section
  also gives it a small stirring motion.
- The lamplight fluctuates softly. Click or tap the shade for a gentle shimmer.
- Drag horizontally on narrow screens to explore. Left/right arrow keys work
  when the room is focused.
- A small corner control pauses/resumes motion. Reduced-motion preferences start
  the scene still, and hidden tabs stop rendering.
- WebGL-unavailable browsers retain the static illustration and panning.

The section concepts and choreography are documented in
[`art/room-interactions.md`](art/room-interactions.md). The page, cat, guitar,
and laptop sections are implemented. Books, trophy, record, and phone remain
planned. Edit the page introduction in `src/story-content.js` and the three
object sections in `src/object-section.js`. Their copy is prototype content
without invented career history.

## How it works

This first scene uses browser-native JavaScript and one small WebGL shader, with
no runtime dependencies or API calls. The shader makes tiny, feathered changes
to image coordinates around the face and cat, plus local light changes around
the lamp. The original iris texture moves inside a fixed eye opening so the
eyelids keep their shape during a strong sideways glance. It preserves the
painted room without rectangular cutout seams.

This supports restrained ambient motion. Picking up a book, standing, or changing
poses will need matching authored layers or animation frames; a single painting
cannot supply the hidden parts of those movements.

- `src/scene-config.js`: positions and masks calibrated to the expanded artwork.
- `src/renderer.js`: visual effects and WebGL rendering.
- `src/gaze-map.js`: per-eye screen projection and continuous gaze mapping.
- `src/room.js`: pointer input, panning, accessible buttons, motion preferences.
- `src/story-page.js`: modal reading sheet, focus, lifecycle, and layer animation.
- `src/page-motion.js`: reversible timeline and source/viewport projection.
- `src/story-content.js`: editable introduction and story sections.
- `src/object-section.js`: cat, guitar, and laptop sections and their shared animation.
- `public/art/room-scene.jpg`: optimized delivery artwork, about 1.1 MB.
- `public/art/story-*.png`: extracted sheet/nail and retouched background patch.
- `public/art/laptop-front.png`: front view of the room laptop used during its turn toward the visitor.
- `art/`: source prompts, generation metadata, and motion direction.

Gemini generated the illustration using the locally configured key. `.env` stays
local; the built website neither needs nor includes the key. Share/deploy the
contents of `dist/` rather than the project root.

## Checks

```sh
npm run check
npm test
npm run build
```

The calibration grid, markers, rays, and panel are removed from the running
portfolio. The former `dist/gaze-grid.html` URL opens the same clean room as
`dist/preview.html`; the old `?gaze-grid` parameter no longer enables an overlay.
The corrected eye mapping remains active and follows the actual cursor.

The 16 tests cover 1,872 per-eye direction/boundary checks across eight viewport
and pan configurations, the between-eyes baseline, lower-center regressions,
continuous travel to each edge, smoothing, cropping, neck limits, and blinks.
Page tests cover cropped source alignment, readable destination bounds,
mid-flight return, reduced motion, and animation sequencing. Visual browser
review is also necessary when changing masks or artwork.
