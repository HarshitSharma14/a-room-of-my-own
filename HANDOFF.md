# Portfolio project handoff

Last updated: 5 November 2026 (Asia/Kolkata).

## What the user is building

Harshit is building a personal portfolio for the Wispr Flow creative application. The experience is a single illustrated, playful room rather than a conventional scrolling resume. A lounging character, cat, guitar, laptop, hanging poster/page, and other objects invite visitors to explore. The user values the exact feel of the transitions and wants changes shipped quickly. Read `interactive_room_portfolio_brief.md`, `wispr_flow_india_hiring_challenge_2026.md`, `README.md`, and `art/room-interactions.md` for the full product brief and interaction direction. The large `codex-session-01a1a3be-c176-7d93-a70e-0c29719f23a2.md` is historical conversation context; it is not an implementation spec.

## Current user preference and latest decision

- The laptop should appear to turn as a physical laptop, bringing its screen toward the visitor and close enough that the final view is still clearly a laptop screen. The front image should match the illustrated laptop already in the room. `public/art/laptop-front.png` is the approved front view. Keep its current turn and zoom unless the user asks to change them.
- The user asked whether the painted laptop behind the moving one could disappear, as the poster does. We implemented a generated sofa/lap replacement patch in commit `94da9a8`, but the user said, **“it was better earlier.”** That experiment was reverted in commit `239c4bc` and redeployed. Do not restore `laptop-sofa-patch.png` or its overlay without a new, specific request. The currently approved behavior retains the original painted laptop in the background while the front laptop animates.
- This latest request is to preserve a complete handoff in Markdown so another agent can resume. This file records the state after the revert.

## Live and source locations

- Project workspace: `/Users/harshitsharma/weekendProjects/portfolio`
- Public GitHub repo: `https://github.com/HarshitSharma14/a-room-of-my-own`
- Production site: `https://a-room-of-my-own.vercel.app/`
- Also used as a site URL: `https://harshit-portfolio-wisprflow.vercel.app/`
- Vercel project: `harshit-portfolio-wisprflow`
- Latest verified production deployment after reverting the patch: `dpl_DaPeyURCTTpWqzXJWjtmBqD9bkZn` (ready, HTTP 200, title `Harshit Portfolio | Wispr Flow`).
- Published GitHub commit before this handoff file: `239c4bc Revert "Hide painted laptop while front view is open"`.

## Current implementation

- Native HTML/CSS/JavaScript with a small WebGL shader. No runtime dependencies or API calls. Build output is `dist/`; `dist/preview.html` is a standalone preview.
- `src/room.js`: room loop, gaze, viewport crop/pan, hotspots, ambient motion, and section setup.
- `src/scene-config.js`: artwork coordinate calibration and hotspots.
- `src/renderer.js`, `src/gaze-map.js`, `src/scene-math.js`: painted room effects, eyes/head tracking, and coordinate math.
- `src/story-page.js`, `src/story-content.js`, `src/page-motion.js`, `src/page-magic.js`: hanging poster/page story, reversible motion, and sparkle cue.
- `src/object-section.js`: shared cat, guitar, and laptop section behavior. The laptop traveler uses `public/art/laptop-front.png`, CSS 3D turn, scale/position interpolation, and project copy placed inside the screen. Its original room artwork is not removed in the approved version.
- `src/room.css`: traveler, laptop, dialogs, overlays, and responsive styling.
- `scripts/build.mjs`: copies source and art to `dist/` and builds portable preview. Add any new runtime image to its `pageAssets` list.
- `index.html`: document title and room markup. `vercel.json` builds with `npm run build` and publishes `dist/`.
- `art/` contains generation prompts and visual direction. `public/art/room-scene.jpg` is the optimized displayed room.

Implemented interactions: hanging poster/page, cat, guitar, laptop, eye/head tracking, blinking, cat breathing/tail motion, lamp shimmer, narrow-screen horizontal panning, pause control, reduced-motion behavior, and a static fallback when WebGL is unavailable. Books, trophy, record, and phone are still concepts. Cat/guitar/laptop copy is placeholder prose; avoid inventing Harshit's career history.

## Build, test, and release

From the workspace, run `npm run check`, `npm test`, and `npm run build`. At this handoff, all 18 tests pass, the build succeeds, and the approved revert is deployed. Visual review is needed for art, masks, and transition changes.

**Important Git setup:** The working directory has older, uncommitted implementation changes and a very large exported conversation in its local history. Earlier publishing used a clean release snapshot at `/private/tmp/portfolio-release-tuRqof`, whose `origin` is the GitHub repo. The release snapshot has the deployed code and clean `main`; its current head is `239c4bc` before adding this handoff. The workspace files contain the same runtime implementation but are not a clean Git checkout. Check `git status` and compare files before copying or committing. Do not reset the workspace or commit the huge historical transcript by accident. The `/private/tmp` snapshot may disappear in a future session; if so, clone the public repo into a fresh directory and reconcile intentional workspace edits there.

For a code release, update the clean release checkout, run the three checks above, commit and `git push origin main`, then deploy manually from that checkout:

```sh
npx --yes vercel deploy --prod --project harshit-portfolio-wisprflow --yes --verify
```

The Vercel GitHub auto-deploy integration did not work in earlier attempts because of GitHub app access. Manual CLI deployment has worked. After deploying, verify the production URL and any new asset. User has already authorized GitHub pushes and Vercel deployments for this project.

## Resume point

The user has not requested another visual change after the revert. The immediate task is to keep this handoff file in the workspace and GitHub. For future laptop work, start with the approved transition in `src/object-section.js` and `public/art/laptop-front.png`; ask for a concrete new visual direction only if the user's next instruction leaves a material ambiguity.
