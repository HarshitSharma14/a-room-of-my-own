# The room as a portfolio

Approved direction: six objects become six sections. The character notices the
selection before the object moves. His eyes react, a small gesture follows,
the object comes forward, and its content opens. The room stays behind it,
gently dimmed. Closing reverses the object's journey. No calibration UI.

| Object | Character and object choreography | Content |
| --- | --- | --- |
| Hanging page | The nail loosens immediately; the page swings, detaches, and floats into the center. It opens into a readable sheet. Closing sends it back and reseats the nail. | About me and career story |
| Cat | His foot sends a sparkle cue to the cat. The cat stirs and its section comes forward. | A quieter side of the room |
| Laptop | The laptop immediately turns its screen toward the visitor and expands across the viewport to show projects. | Projects and how they were built |
| Guitar | His foot sends a sparkle cue to the guitar. It comes forward and opens a space for interests. | Life beyond coding |
| Books | He glances toward the shelf. A book slides out and opens in the center. Page turns move through chapters. | Skills and learning journey, supported by examples |
| Trophy | A sleepy smile, then a glint. The trophy lifts forward and its engraved plate expands. Selecting a milestone reveals its story. | Achievements, awards, certificates, milestones |
| Record and sleeve | He nods subtly. A record slides out and spins; the sleeve opens as a scrapbook. Audio is opt-in. | Interests, photography, music, life beyond coding |
| Phone | A notification catches his attention. He turns the phone outward and it floats toward the visitor. | Email, GitHub, LinkedIn, contact |

The hanging page, cat, guitar, and laptop are implemented. Books, trophy,
record, and phone remain planned. The lamp retains its ambient reaction.
Large hand/body poses for later objects need matching authored artwork layers.

## First interaction: hanging page

Use the existing loose sheet at the lower-right of the corkboard. Do not add a
new button/card to the room. Hover/focus may reveal a small “My story” label;
the page itself is the touch and keyboard target.

Sequence: `idle → loosening → flying → open → returning → idle`.

- The nail starts releasing on click. The paper briefly rocks around its upper edge,
  then arcs into the center and straightens.
- Use an extracted paper sprite during travel. A restored background patch
  covers the original sheet while it is away, so there is no duplicate page.
- Fade from the illustration into a warm, readable paper surface as it grows.
  Copy stays selectable; the sheet scrolls internally on smaller screens.
- The character follows the moving paper. Normal pointer tracking resumes after
  it returns. His body stays supported on the sofa.
- The backdrop, close button, and Escape all return the page. Closing during
  flight reverses from its current position. Repeated activation is ignored.
- A modal dialog traps focus; the room is inactive while reading. Return focus
  to the original page button after closing. Support keyboard activation.
- Paused/reduced motion opens and closes immediately. Content remains available
  without WebGL. Resizing recomputes both the source anchor and readable sheet.
- On narrow screens, pan to the pinboard using the room's existing drag/arrow
  controls. The source anchor follows the same artwork crop as every hotspot.

## Copy

`src/story-content.js` contains editable first-person draft copy for this
prototype. The introduction describes this room project. No employer, dates,
awards, qualifications, or career history are invented. Replace the draft with
the user's biography and career milestones when supplied.

## Acceptance

The original sheet disappears as the floating sheet leaves, the nail visibly
releases, and the central sheet is readable. Close at any stage without stuck
overlays, duplicate paper, or stranded focus. Verify repeated open/close, Escape,
backdrop close, pause/reduced motion, narrow-screen scrolling, resizing, and
preservation of the corrected eye tracking. Grid diagnostics remain disabled.
