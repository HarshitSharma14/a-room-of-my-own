export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function damp(current, target, speed, dt) {
  return current + (target - current) * (1 - Math.exp(-speed * Math.max(0, dt)));
}

// Returns the visible part of the artwork, in normalized image coordinates.
export function coverCrop(width, height, imageWidth, imageHeight, centerX = .56, centerY = .52) {
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const cropWidth = width / (imageWidth * scale);
  const cropHeight = height / (imageHeight * scale);
  return {
    x: clamp(centerX - cropWidth / 2, 0, 1 - cropWidth),
    y: clamp(centerY - cropHeight / 2, 0, 1 - cropHeight),
    width: cropWidth,
    height: cropHeight,
  };
}

export function gazeAt(x, y, rect, crop, face) {
  const worldX = crop.x + clamp((x - rect.left) / rect.width, 0, 1) * crop.width;
  const worldY = crop.y + clamp((y - rect.top) / rect.height, 0, 1) * crop.height;
  // The face is off-center. Give each side its full visible cursor range;
  // a fixed radius used to clamp the entire left half of the room to -1.
  const axis = (position, origin, start, extent) => {
    const distance = position - origin;
    const range = distance < 0 ? origin - start : start + extent - origin;
    return clamp(distance / Math.max(range, extent * .05, .00001), -1, 1);
  };
  return [axis(worldX, face[0], crop.x, crop.width), axis(worldY, face[1], crop.y, crop.height)];
}

export function headPose(gaze) {
  const x = clamp(gaze[0], -1, 1), y = clamp(gaze[1], -1, 1);
  // Most of the neck turn happens toward the edges of the screen. The eyes
  // respond first; room.js damps the head more slowly behind them.
  const turn = x ** 3;
  return {tilt: .028 * x + .062 * turn + .012 * y,
    shift: [2.5 * x + 4.5 * turn, y + Math.abs(turn) * .5]};
}

export function blinkAt(time, start) {
  const t = time - start;
  if (t < 0 || t >= .24) return 0;
  if (t < .075) return t / .075;
  if (t < .115) return 1;
  return 1 - (t - .115) / .125;
}
