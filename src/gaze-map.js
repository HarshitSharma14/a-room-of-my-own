import { clamp } from './scene-math.js';

const rotate = ([x, y], angle) => [
  Math.cos(angle) * x - Math.sin(angle) * y,
  Math.sin(angle) * x + Math.cos(angle) * y,
];

export function eyeMidpointInArtwork(scene) {
  const points=scene.eyes.map(eye=>{
    const local=rotate(eye.neutral,eye.angle);
    return eye.center.map((v,i)=>v+local[i]/scene.size[i]);
  });
  return points[0].map((v,i)=>(v+points[1][i])/2);
}

export function eyeMidpointOnScreen(pose, scene, rect, crop) {
  const points=scene.eyes.map(eye=>eyePointOnScreen(eye.neutral,eye,pose,scene,rect,crop));
  return points[0].map((v,i)=>(v+points[1][i])/2);
}

// Project an anatomical eye-local point through the current neck pose and the
// exact same cover crop as the renderer. Both axes remain in CSS pixels.
export function eyePointOnScreen(localPoint, eye, pose, scene, rect, crop) {
  const size = scene.size;
  const local = rotate(localPoint, eye.angle);
  const pivot = scene.head.pivot.map((v, i) => v * size[i]);
  const offset = eye.center.map((v, i) => v * size[i] + local[i] - pivot[i]);
  const turned = rotate(offset, pose.tilt);
  const world = turned.map((v, i) => v + pivot[i] + pose.shift[i]);
  return [rect.left + (world[0] / size[0] - crop.x) / crop.width * rect.width,
    rect.top + (world[1] / size[1] - crop.y) / crop.height * rect.height];
}

export function pupilAt(x, y, eye, pose, scene, rect, crop) {
  const origin = eyePointOnScreen(eye.neutral, eye, pose, scene, rect, crop);
  const delta = [x - origin[0], y - origin[1]];
  const distance = Math.hypot(...delta);
  if (distance < 1e-7) return {center: [...eye.neutral], origin, progress: 0};

  const direction = delta.map(v => v / distance);
  // Intersect this exact gaze ray with the visible viewport boundary. This
  // gives every point a continuous response without stretching x versus y.
  const axisEdge = (d, start, extent, at) => Math.abs(d) < 1e-9 ? Infinity
    : ((d > 0 ? start + extent : start) - at) / d;
  const edgeDistance = Math.max(1, Math.min(
    axisEdge(direction[0], rect.left, rect.width, origin[0]),
    axisEdge(direction[1], rect.top, rect.height, origin[1]),
  ));
  const progress = clamp(distance / edgeDistance, 0, 1);
  const response = Math.sin(progress * Math.PI / 2);
  const localDirection = rotate(direction, -eye.angle - pose.tilt);
  // An ellipse limits the distance along the ray. Scaling its two components
  // independently would rotate the gaze and reverse lower-middle tracking.
  const reach = 1 / Math.hypot(localDirection[0] / eye.travel[0], localDirection[1] / eye.travel[1]);
  const center = eye.neutral.map((v, i) => v + localDirection[i] * reach * response);
  return {center, origin, progress};
}

export function mapPupils(x, y, pose, scene, rect, crop) {
  return scene.eyes.map(eye => pupilAt(x, y, eye, pose, scene, rect, crop));
}

export function screenGrid(columns = 13, rows = 9) {
  return Array.from({length: columns * rows}, (_, i) => {
    const column = i % columns, row = Math.floor(i / columns);
    return {id: `${String.fromCharCode(65 + column)}${row + 1}`,
      u: column / (columns - 1), v: row / (rows - 1), column, row};
  });
}
