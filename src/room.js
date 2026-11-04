import { scene } from './scene-config.js';
import { clamp, damp, coverCrop, gazeAt, blinkAt, headPose } from './scene-math.js';
import { mapPupils, eyeMidpointInArtwork } from './gaze-map.js';
import { createRenderer } from './renderer.js';
import { createStoryPage } from './story-page.js';
import { createObjectSection } from './object-section.js';

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
let lampStart = -100;
let pointer = null;
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

const targets = [
  {id:'cat', label:'Pet the sleeping cat', center:scene.cat.center, radius:scene.cat.radius},
  {id:'lamp', label:'Give the lamp a gentle shimmer', center:scene.lamp.center, radius:scene.lamp.radius},
  {id:'story', label:'Read my story on the hanging page', center:scene.page.center, radius:scene.page.radius},
  {id:'laptop', label:'Explore projects on the laptop', center:scene.laptop.center, radius:scene.laptop.radius},
  {id:'clock', label:'Check the time', center:scene.clock.center, radius:scene.clock.radius},
  {id:'guitar', label:'Play the guitar', center:scene.guitar.center, radius:scene.guitar.radius},
  {id:'controller', label:'Play a game', center:scene.controller.center, radius:scene.controller.radius},
].map(target => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'room-hotspot';
  button.setAttribute('aria-label', target.label);
  button.dataset.object = target.id;
  if(target.id==='story')button.dataset.label='My story';
  button.addEventListener('click', event => {
    if (drag?.moved) { event.preventDefault(); return; }

    // Story is handled by its own module, don't do anything here.
    if (['story','cat','guitar','laptop'].includes(target.id)) return;

    // Cat and lamp have simple pulse effects.
    if (target.id === 'lamp') {
      lampStart = time;
      status.textContent = paused ? 'The lamp is warm and steady. Motion is paused.' : 'The lamplight shimmers softly.';
    } else {
      // Other items pan into view.
      targetCenter = target.center[0];
      status.textContent = `Focused on ${target.label}.`;
    }

    room.dataset.lastInteraction = target.id;
    schedule();
  });
  room.append(button);
  return {...target, button};
});

function positionTargets() {
  for (const t of targets) {
    const x = (t.center[0] - crop.x) / crop.width;
    const y = (t.center[1] - crop.y) / crop.height;
    t.button.style.left = `${x * 100}%`; t.button.style.top = `${y * 100}%`;
    t.button.style.width = `${2 * t.radius[0] / crop.width * 100}%`;
    t.button.style.height = `${2 * t.radius[1] / crop.height * 100}%`;
    t.button.hidden = x < -.08 || x > 1.08 || y < -.08 || y > 1.08;
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
  const lampAge = time - lampStart;
  const lampPulse = !paused && lampAge >= 0 && lampAge < 2.8 ? Math.sin(lampAge / 2.8 * Math.PI) : 0;
  footMotion=paused?0:damp(footMotion,activeSection?.getFootGesture()||0,18,dt);
  renderer?.draw({crop,gaze,pupils,tracking,time,motion:!paused,blink:paused ? 0 : blinkAt(time,nextBlink),pet,lampPulse,footMotion});
  fallbackPosition(); positionTargets();
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
sections=['cat','guitar','laptop'].map(id=>createObjectSection({id,room,image,scene,
  button:targets.find(target=>target.id===id).button,getView:()=>({rect,crop}),
  getFootMotion:()=>footMotion,isStill:()=>paused,onChange:schedule,onCue:target=>{
    if(target==='cat')petStart=time;
    room.dataset.lastInteraction=target;
    status.textContent=`Opened ${target} section.`;
  }}));
start();
