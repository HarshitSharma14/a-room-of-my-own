# Portfolio project handoff

Last updated: 5 November 2026 (Asia/Kolkata).

## What the user is building

Harshit is building a personal portfolio for the Wispr Flow creative application. The experience is a single illustrated, playful room rather than a conventional scrolling resume. A lounging character, cat, guitar, laptop, hanging poster/page, and other objects invite visitors to explore. The user values the exact feel of the transitions and wants changes shipped quickly. Read `interactive_room_portfolio_brief.md`, `wispr_flow_india_hiring_challenge_2026.md`, `README.md`, and `art/room-interactions.md` for the full product brief and interaction direction. The large `codex-session-01a1a3be-c176-7d93-a70e-0c29719f23a2.md` is historical conversation context; it is not an implementation spec.

## Current user preference and latest decision

- The laptop should appear to turn as a physical laptop, bringing its screen toward the visitor and close enough that the final view is still clearly a laptop screen. The front image should match the illustrated laptop already in the room. `public/art/laptop-front.png` is the approved front view. Keep its current turn and zoom unless the user asks to change them.
- The user clarified that **the front laptop and its transition must stay exactly as they are**. Their only request is for the original painted laptop behind it to disappear when the front laptop appears, as the poster does. The first room patch in commit `94da9a8` covered too much of the surrounding person and sofa; the user disliked that version, so it was reverted in `239c4bc`. The current fix reuses the replacement art but clips its display tightly to the painted laptop's shape. Do not alter the front laptop art, turn, zoom, text, or timing as part of this behavior.
- This file is the requested resume context. Keep it current when important visual decisions change.

## Live and source locations

- Project workspace: `/Users/harshitsharma/weekendProjects/portfolio`
- Public GitHub repo: `https://github.com/HarshitSharma14/a-room-of-my-own`
- Production site: `https://a-room-of-my-own.vercel.app/`
- Also used as a site URL: `https://harshit-portfolio-wisprflow.vercel.app/`
- Vercel project: `harshit-portfolio-wisprflow`
- Latest verified production deployment after reverting the patch: `dpl_DaPeyURCTTpWqzXJWjtmBqD9bkZn` (ready, HTTP 200, title `Harshit Portfolio | Wispr Flow`).
- The prior revert was `239c4bc`; the next commit restores only the narrowly clipped laptop cover. Check `git log -1` for the latest published commit.

## Current implementation

- Native HTML/CSS/JavaScript with a small WebGL shader. No runtime dependencies or API calls. Build output is `dist/`; `dist/preview.html` is a standalone preview.
- `src/room.js`: room loop, gaze, viewport crop/pan, hotspots, ambient motion, and section setup.
- `src/scene-config.js`: artwork coordinate calibration and hotspots.
- `src/renderer.js`, `src/gaze-map.js`, `src/scene-math.js`: painted room effects, eyes/head tracking, and coordinate math.
- `src/story-page.js`, `src/story-content.js`, `src/page-motion.js`, `src/page-magic.js`: hanging poster/page story, reversible motion, and sparkle cue.
- `src/object-section.js`: shared cat, guitar, and laptop section behavior. The laptop traveler uses `public/art/laptop-front.png`, CSS 3D turn, scale/position interpolation, and project copy placed inside the screen. A separate `laptop-room-patch` covers the original painted laptop once the traveler appears and is hidden again on close.
- `public/art/laptop-sofa-patch.png` and its `clip-path` in `src/room.css` replace only the painted laptop footprint. The broad feathered cover from commit `94da9a8` is intentionally not used.
- `src/room.css`: traveler, laptop, dialogs, overlays, and responsive styling.
- `scripts/build.mjs`: copies source and art to `dist/` and builds portable preview. Add any new runtime image to its `pageAssets` list.
- `index.html`: document title and room markup. `vercel.json` builds with `npm run build` and publishes `dist/`.
- `art/` contains generation prompts and visual direction. `public/art/room-scene.jpg` is the optimized displayed room.

Implemented interactions: hanging poster/page, cat, guitar, laptop, eye/head tracking, blinking, cat breathing/tail motion, lamp shimmer, narrow-screen horizontal panning, pause control, reduced-motion behavior, and a static fallback when WebGL is unavailable. Books, trophy, record, and phone are still concepts. Cat/guitar/laptop copy is placeholder prose; avoid inventing Harshit's career history.

## Build, test, and release

From the workspace, run `npm run check`, `npm test`, and `npm run build`. At this update, all 18 tests pass and the build succeeds. A headless Chrome review checked mid-transition, fully open, and close behavior. Visual review is needed for art, masks, and transition changes.

**Important Git setup:** The working directory has older, uncommitted implementation changes and a very large exported conversation in its local history. Publishing uses a clean release snapshot at `/private/tmp/portfolio-release-tuRqof`, whose `origin` is the GitHub repo. The workspace files contain the same runtime implementation but are not a clean Git checkout. Check `git status` and compare files before copying or committing. Do not reset the workspace or commit the huge historical transcript by accident. The `/private/tmp` snapshot may disappear in a future session; if so, clone the public repo into a fresh directory and reconcile intentional workspace edits there.

For a code release, update the clean release checkout, run the three checks above, commit and `git push origin main`, then deploy manually from that checkout:

```sh
npx --yes vercel deploy --prod --project harshit-portfolio-wisprflow --yes --verify
```

The Vercel GitHub auto-deploy integration did not work in earlier attempts because of GitHub app access. Manual CLI deployment has worked. After deploying, verify the production URL and any new asset. User has already authorized GitHub pushes and Vercel deployments for this project.

## Resume point

The current request is to hide only the original painted laptop during the existing front laptop transition. This has been implemented and visually checked locally. For future laptop work, preserve the approved transition in `src/object-section.js` and `public/art/laptop-front.png` unless the user asks to change them.
