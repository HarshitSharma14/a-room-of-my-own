import { scene } from './scene-config.js';
import { clamp, damp, coverCrop, gazeAt, blinkAt, headPose } from './scene-math.js';
import { mapPupils, eyeMidpointInArtwork } from './gaze-map.js';
import { projectPageRect } from './page-motion.js';
import { createRenderer } from './renderer.js';
import { createStoryPage } from './story-page.js';
import { createObjectSection } from './object-section.js';
import { createGazeGrid } from './gaze-grid.js';

const room = document.querySelector('#room');
const image = document.querySelector('#room-image');
const canvas = document.querySelector('#room-canvas');
const toggle = document.querySelector('#motion-toggle');
const status = document.querySelector('#room-status');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');
let paused = preference.matches;
let renderer = null;
let frameId = 0;
let lastFrame = 0;
let time = 0;
let nextBlink = 4.4;
let petStart = -100;
let pointer = null;
let gazeGrid = null;
const gazeOrigin = eyeMidpointInArtwork(scene);
let gaze = [0,0];
let pupils = scene.eyes.map(eye => eye.iris.slice(0, 2));
let tracking = 0;
let narrow = innerWidth < 650;
let centerX = narrow ? scene.mobileCenter[0] : scene.center[0];
let targetCenter = centerX;
let crop = coverCrop(innerWidth, innerHeight, 2752, 1536, centerX);
let rect = room.getBoundingClientRect();
let drag = null;
let story = null;
let sections = [];
let footMotion = 0;

function fallbackPosition() {
  const x = crop.width < .999 ? crop.x / (1 - crop.width) * 100 : 50;
  const y = crop.height < .999 ? crop.y / (1 - crop.height) * 100 : 50;
  image.style.objectPosition = `${x}% ${y}%`;
}

const targetOutlines = {
  cat: `<svg class="hotspot-halo" viewBox="0 0 350 250" aria-hidden="true">
    <path class="hotspot-halo-glow" d="M 58,102 C 60,95 85,92 115,102 L 129,74 C 150,68 180,68 205,74 C 235,82 255,105 257,135 C 259,155 245,170 215,173 C 185,175 145,175 120,170 L 84,170 C 72,166 65,158 68,148 C 72,138 60,120 58,102 Z"/>
    <path class="hotspot-halo-stroke" d="M 58,102 C 60,95 85,92 115,102 L 129,74 C 150,68 180,68 205,74 C 235,82 255,105 257,135 C 259,155 245,170 215,173 C 185,175 145,175 120,170 L 84,170 C 72,166 65,158 68,148 C 72,138 60,120 58,102 Z"/>
    <g transform="translate(129, 74)"><path class="hotspot-sparkle hotspot-sparkle--1" d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z"/></g>
    <g transform="translate(257, 135)"><path class="hotspot-sparkle hotspot-sparkle--2" d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z"/></g>
    <g transform="translate(58, 102)"><path class="hotspot-sparkle hotspot-sparkle--3" d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"/></g>
  </svg>`,
  laptop: `<svg class="hotspot-halo" viewBox="0 0 300 300" aria-hidden="true">
    <path class="hotspot-halo-glow" d="M 47,124 L 152,40 L 176,162 L 254,166 L 246,276 L 94,274 L 87,260 Z M 87,260 L 176,162"/>
    <path class="hotspot-halo-stroke" d="M 47,124 L 152,40 L 176,162 L 254,166 L 246,276 L 94,274 L 87,260 Z"/>
    <path class="hotspot-halo-stroke" d="M 87,260 L 176,162" style="stroke-opacity:0.65"/>
    <g transform="translate(152, 40)"><path class="hotspot-sparkle hotspot-sparkle--1" d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z"/></g>
    <g transform="translate(47, 124)"><path class="hotspot-sparkle hotspot-sparkle--2" d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z"/></g>
    <g transform="translate(246, 276)"><path class="hotspot-sparkle hotspot-sparkle--3" d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"/></g>
  </svg>`,
  story: `<svg class="hotspot-halo" viewBox="0 0 130 200" aria-hidden="true">
    <path class="hotspot-halo-glow" d="M 16,16 L 93,13 L 105,153 L 25,163 Z"/>
    <path class="hotspot-halo-stroke" d="M 16,16 L 93,13 L 105,153 L 25,163 Z"/>
    <circle cx="56" cy="23" r="4.5" class="hotspot-halo-stroke"/>
    <g transform="translate(56, 23)"><path class="hotspot-sparkle hotspot-sparkle--1" d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z"/></g>
    <g transform="translate(93, 13)"><path class="hotspot-sparkle hotspot-sparkle--2" d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"/></g>
    <g transform="translate(105, 153)"><path class="hotspot-sparkle hotspot-sparkle--3" d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"/></g>
  </svg>`,
  book: `<svg class="hotspot-halo" viewBox="0 0 400 186" aria-hidden="true">
    <path class="hotspot-halo-glow" d="M 236,73 L 352,117 L 352,126 L 276,186 L 150,153 L 150,143 Z"/>
    <path class="hotspot-halo-stroke" d="M 236,73 L 352,117 L 352,126 L 276,186 L 150,153 L 150,143 Z"/>
    <path class="hotspot-halo-stroke" d="M 150,143 L 276,184 L 352,117" style="stroke-opacity:0.65"/>
    <g transform="translate(236, 73)"><path class="hotspot-sparkle hotspot-sparkle--1" d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z"/></g>
    <g transform="translate(352, 117)"><path class="hotspot-sparkle hotspot-sparkle--2" d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z"/></g>
    <g transform="translate(276, 186)"><path class="hotspot-sparkle hotspot-sparkle--3" d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z"/></g>
  </svg>`
};

const targets = [
  {id:'story', label:'Read my story on the hanging page', bounds: [360, 490, 130, 200]},
  {id:'cat', label:'Pet the sleeping cat', bounds: [1000, 700, 350, 250]},
  {id:'laptop', label:'Explore projects on the laptop', bounds: [1380, 600, 300, 300]},
  {id:'book', label:'Open the green book on the floor', bounds: [1250, 1350, 400, 186]},
].map(target => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'room-hotspot';
  button.setAttribute('aria-label', target.label);
  button.dataset.object = target.id;
  if(target.id==='story')button.dataset.label='My story';
  button.innerHTML = targetOutlines[target.id] || '';
  button.addEventListener('click', event => {
    if (drag?.moved) { event.preventDefault(); return; }

    // Handled by their respective modules
    if (['story','cat','laptop','book'].includes(target.id)) return;

    room.dataset.lastInteraction = target.id;
    schedule();
  });
  room.append(button);
  return {...target, button};
});

function positionTargets() {
  for (const t of targets) {
    const projected = projectPageRect(t.bounds, scene, rect, crop);
    t.button.style.left = `${projected.left}px`;
    t.button.style.top = `${projected.top}px`;
    t.button.style.width = `${projected.width}px`;
    t.button.style.height = `${projected.height}px`;
    t.button.hidden = projected.left + projected.width < -15 || projected.left > rect.width + 15 ||
                      projected.top + projected.height < -15 || projected.top > rect.height + 15;
  }
}

function resize() {
  rect = room.getBoundingClientRect();
  const nextNarrow = rect.width < 650;
  if (nextNarrow !== narrow) {
    narrow = nextNarrow;
    centerX = targetCenter = narrow ? scene.mobileCenter[0] : scene.center[0];
  }
  crop = coverCrop(rect.width, rect.height, image.naturalWidth || 2752, image.naturalHeight || 1536, centerX, scene.center[1]);
  targetCenter = clamp(targetCenter, crop.width / 2, 1 - crop.width / 2);
  centerX = clamp(centerX, crop.width / 2, 1 - crop.width / 2);
  room.dataset.pannable = String(crop.width < .98);
  renderer?.resize(rect.width, rect.height);
  fallbackPosition(); positionTargets(); schedule();
}

function paint(now) {
  frameId = 0;
  if (document.hidden) return;
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 1/60;
  lastFrame = now;
  if (!paused) time += dt;
  centerX = damp(centerX, targetCenter, 13, dt);
  crop = coverCrop(rect.width, rect.height, image.naturalWidth || 2752, image.naturalHeight || 1536, centerX, scene.center[1]);
  // Recompute after a pan or resize even if the mouse has not moved again.
  const activeSection=story?.active?story:sections.find(section=>section.active);
  const cursor = activeSection ? activeSection.getFocus() : pointer;
  const target = paused || !cursor ? [0,0] : gazeAt(...cursor, rect, crop, gazeOrigin);
  gaze = gaze.map((value,i) => paused ? 0 : damp(value,target[i],4.6,dt));
  const pose = headPose(gaze);
  const mapped = cursor && !paused ? mapPupils(...cursor, pose, scene, rect, crop) : null;
  pupils = pupils.map((point, i) => point.map((value, axis) => paused
    ? scene.eyes[i].iris[axis]
    : damp(value, mapped?.[i].center[axis] ?? scene.eyes[i].iris[axis], 12, dt)));
  tracking = paused ? 0 : damp(tracking, mapped ? 1 : 0, 12, dt);
  if (time > nextBlink + .26) nextBlink = time + 3.8 + Math.random() * 3.3;
  const petAge = time - petStart;
  const pet = !paused && petAge >= 0 && petAge < 2.5 ? Math.sin(petAge / 2.5 * Math.PI) : 0;
  footMotion=paused?0:damp(footMotion,activeSection?.getFootGesture()||0,18,dt);
  renderer?.draw({crop,gaze,pupils,tracking,time,motion:!paused,blink:paused ? 0 : blinkAt(time,nextBlink),pet,footMotion});
  fallbackPosition(); positionTargets();
  if (gazeGrid) {
    const gridTarget = gazeGrid.getTarget(rect, crop);
    gazeGrid.update({ rect, crop, pose, pupils, canvas, cursor: gridTarget || (pointer ? pointer : null), renderer });
  }
  if (renderer && !paused || Math.abs(centerX-targetCenter) > .00001) schedule();
}

function schedule() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(paint); }

function updateToggle() {
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', paused ? 'Resume room animation' : 'Pause room animation');
  toggle.title = paused ? 'Resume animation' : 'Pause animation';
  room.dataset.motion = paused ? 'paused' : 'playing';
}

toggle.addEventListener('click', () => { paused = !paused; updateToggle(); schedule(); });
preference.addEventListener('change', () => { paused = preference.matches; updateToggle(); schedule(); });

addEventListener('pointermove', event => {
  if (event.pointerType !== 'touch' && !coarse.matches) {
    pointer = [event.clientX, event.clientY];
    schedule();
  }
  if (drag && event.pointerId === drag.id) {
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 6) drag.moved = true;
    if (drag.moved) targetCenter = clamp(drag.center - dx / rect.width * crop.width, crop.width / 2, 1-crop.width/2);
    schedule(); return;
  }
});
addEventListener('pointerout', event => { if (!event.relatedTarget) { pointer = null; schedule(); } });
addEventListener('blur', () => { pointer = null; schedule(); });
room.addEventListener('pointerdown', event => {
  if (event.button !== 0 || crop.width >= .98 || event.target.closest('button')) return;
  drag = {id:event.pointerId,x:event.clientX,center:targetCenter,moved:false};
  room.dataset.dragging = 'true';
  room.setPointerCapture(event.pointerId);
});
function stopDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  room.dataset.dragging = 'false';
  if (room.hasPointerCapture(event.pointerId)) room.releasePointerCapture(event.pointerId);
  // Leave the moved flag through the click event dispatched after pointerup.
  const finished = drag;
  setTimeout(() => { if (drag === finished) drag = null; },0);
}
room.addEventListener('pointerup', stopDrag);
room.addEventListener('pointercancel', stopDrag);
room.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  targetCenter = clamp(targetCenter + (event.key === 'ArrowLeft' ? -.08 : .08), crop.width/2,1-crop.width/2);
  schedule();
});
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId=0; lastFrame=0; }
  else schedule();
});

function stillFallback(message) {
  room.dataset.renderer = 'image';
  renderer = null; paused = true; toggle.disabled = true;
  updateToggle(); status.textContent = message;
  resize();
}

async function start() {
  try {
    await image.decode();
    renderer = createRenderer(canvas,image,scene);
    if (!renderer) { stillFallback('A still version of the room is displayed.'); return; }
    toggle.disabled = false; room.dataset.renderer = 'webgl';
    updateToggle(); resize();
  } catch (error) {
    console.error('Could not start room animation:',error);
    stillFallback('A still version of the room is displayed.');
  }
}

canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); cancelAnimationFrame(frameId); frameId=0;
  stillFallback('The room is displayed as a still image.');
});
canvas.addEventListener('webglcontextrestored', () => { paused=preference.matches; start(); });
addEventListener('pagehide', () => { cancelAnimationFrame(frameId); renderer?.destroy(); });
addEventListener('pageshow', event => { if (event.persisted) start(); });
updateToggle();
story=createStoryPage({room,button:targets.find(target=>target.id==='story').button,scene,
  getView:()=>({rect,crop}),getFootMotion:()=>footMotion,isStill:()=>paused,onChange:schedule});
sections=['cat','laptop','book'].map(id=>createObjectSection({id,room,image,scene,
  button:targets.find(target=>target.id===id).button,getView:()=>({rect,crop}),
  getFootMotion:()=>footMotion,isStill:()=>paused,onChange:schedule,onCue:target=>{
    if(target==='cat')petStart=time;
    room.dataset.lastInteraction=target;
    status.textContent=`Opened ${target} section.`;
  }}));
if (window.ENABLE_GAZE_GRID || location.search.includes('grid') || location.pathname.includes('gaze-grid')) {
  gazeGrid = createGazeGrid(scene, schedule);
  room.addEventListener('click', event => {
    if (event.target.closest('.gaze-panel') || event.target.closest('.gaze-point') || event.target.closest('.object-dialog')) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const artX = Math.round((crop.x + x * crop.width) * 2752);
    const artY = Math.round((crop.y + y * crop.height) * 1536);
    console.log(`Clicked artwork coordinates: x=${artX}, y=${artY}`);
    console.log(`phone: { center: [${artX}/2752, ${artY}/1536], radius: [40/2752, 45/1536], bounds: [${artX-35}, ${artY-40}, 70, 80] },`);
  });
}
start();
