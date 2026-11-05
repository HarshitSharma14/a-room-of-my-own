// Small, feathered texture deformations preserve the illustration and avoid
// rectangular cutout seams. Large pose changes will use authored state assets.
import { headPose } from './scene-math.js';
import { footPose } from './page-motion.js';

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_position.x + 1.0) * .5, (1.0 - a_position.y) * .5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_size;
uniform vec4 u_crop;
uniform float u_headTilt;
uniform vec2 u_headShift;
uniform vec2 u_pupilA;
uniform vec2 u_pupilB;
uniform float u_tracking;
uniform float u_time;
uniform float u_motion;
uniform float u_blink;
uniform float u_pet;
uniform float u_lampPulse;
uniform float u_footAngle;
uniform vec2 u_footShift;
uniform vec4 u_foot;
uniform vec2 u_ankle;
uniform vec4 u_head;
uniform vec2 u_pivot;
uniform vec4 u_eyeA;
uniform vec4 u_eyeB;
uniform vec4 u_irisA;
uniform vec4 u_irisB;
uniform vec2 u_eyeAngles;
uniform vec4 u_cat;
uniform vec4 u_tail;
uniform vec4 u_lamp;

mat2 rotation(float a) { return mat2(cos(a), sin(a), -sin(a), cos(a)); }
float region(vec2 uv, vec4 r) {
  return 1.0 - smoothstep(.48, 1.0, length((uv - r.xy) / r.zw));
}

vec3 eyeColor(vec3 color, vec2 uv, vec4 eye, vec4 iris, vec2 pupil, float angle) {
  vec2 local = rotation(-angle) * ((uv - eye.xy) * u_size);
  // Clip moving irises inside the painted opening. Moving a large eye-region
  // UV mask stretches the lids and picks up skin at an extreme sideways glance.
  float x = (local.x + 2.3) / 12.0;
  float upper = -4.6 + 3.3 * x * x;
  float lower = 4.8 - 6.1 * x * x;
  float aperture = smoothstep(upper, upper + .6, local.y) *
    (1.0 - smoothstep(lower - .6, lower, local.y)) *
    (1.0 - smoothstep(.97, 1.0, abs(x)));
  vec2 whiteUV = eye.xy + rotation(angle) * vec2(-9.0, .3) / u_size;
  vec3 white = texture2D(u_image, whiteUV).rgb * mix(.94, 1.0, smoothstep(-4.0, 4.0, local.y));
  vec2 sourceLocal = local - (pupil - iris.xy);
  float irisMask = 1.0 - smoothstep(.88, 1.0, length((sourceLocal - iris.xy) / iris.zw));
  vec2 irisUV = eye.xy + rotation(angle) * sourceLocal / u_size;
  vec3 irisColor = texture2D(u_image, irisUV).rgb;
  vec3 movingEye = mix(white, irisColor, irisMask);
  float active = u_tracking * (1.0 - u_blink);
  return mix(color, movingEye, aperture * active);
}

vec3 eyelid(vec3 color, vec2 uv, vec4 eye, float angle) {
  vec2 local = rotation(-angle) * ((uv - eye.xy) * u_size);
  vec2 radii = eye.zw * u_size;
  float mask = 1.0 - smoothstep(.75, 1.0, length(local / radii));
  vec2 upper = eye.xy + rotation(angle) * vec2(0.0, -radii.y * 1.9) / u_size;
  vec3 skin = texture2D(u_image, upper).rgb;
  color = mix(color, skin, mask * u_blink);
  float curvedY = local.y - 1.25 + .018 * local.x * local.x;
  float ink = (1.0 - smoothstep(.6, 1.5, abs(curvedY))) *
    (1.0 - smoothstep(.6, .93, abs(local.x) / radii.x));
  return mix(color, vec3(.105, .091, .105), ink * u_blink);
}

void main() {
  vec2 source = u_crop.xy + v_uv * u_crop.zw;
  vec2 uv = source;

  float headMask = region(uv, u_head);
  vec2 pixelOffset = (uv - u_pivot) * u_size;
  vec2 headUV = u_pivot + rotation(-u_headTilt) * (pixelOffset - u_headShift) / u_size;
  uv = mix(uv, headUV, headMask);

  // The raised sock flexes around its supported ankle to launch the magic.
  float footMask = region(uv, u_foot);
  vec2 footUV = u_ankle + rotation(-u_footAngle) * ((uv-u_ankle)*u_size-u_footShift) / u_size;
  uv = mix(uv, footUV, footMask);

  float catMask = region(uv, u_cat);
  float breath = sin(u_time * 1.32) * .9 * u_motion;
  uv.y -= (breath + u_pet * 2.8) / u_size.y * catMask;
  float tailMask = region(uv, u_tail);
  float tailBeat = pow(max(0.0, sin(u_time * .30)), 12.0);
  float tailAngle = (tailBeat * sin(u_time * 2.8) * .028 + u_pet * .065) * u_motion;
  vec2 tailDelta = (uv - u_tail.xy) * u_size;
  uv = mix(uv, u_tail.xy + rotation(-tailAngle) * tailDelta / u_size, tailMask);

  vec2 faceUV = uv;
  vec3 color = texture2D(u_image, clamp(uv, 0.0, 1.0)).rgb;
  color = eyeColor(color, faceUV, u_eyeA, u_irisA, u_pupilA, u_eyeAngles.x);
  color = eyeColor(color, faceUV, u_eyeB, u_irisB, u_pupilB, u_eyeAngles.y);
  color = eyelid(color, faceUV, u_eyeA, u_eyeAngles.x);
  color = eyelid(color, faceUV, u_eyeB, u_eyeAngles.y);

  gl_FragColor = vec4(color, 1.0);
}`;

export function createRenderer(canvas, image, scene) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;

  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(`Room shader: ${message}`);
    }
    return s;
  }

  const vs = shader(gl.VERTEX_SHADER, vertexSource);
  const fs = shader(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  const uniforms = {};
  for (const name of ['size','crop','headTilt','headShift','pupilA','pupilB','tracking','time','motion','blink','pet','lampPulse','footAngle','footShift','foot','ankle','head','pivot','eyeA','eyeB','irisA','irisB','eyeAngles','cat','tail','lamp','clock','guitar','controller']) {
    uniforms[name] = gl.getUniformLocation(program, `u_${name}`);
  }
  gl.uniform2f(uniforms.size, image.naturalWidth, image.naturalHeight);
  const region = (name, center, radius) => gl.uniform4f(uniforms[name], ...center, ...radius);
  region('head', scene.head.center, scene.head.radius);
  gl.uniform2f(uniforms.pivot, ...scene.head.pivot);
  region('eyeA', scene.eyes[0].center, scene.eyes[0].radius);
  region('eyeB', scene.eyes[1].center, scene.eyes[1].radius);
  gl.uniform4f(uniforms.irisA, ...scene.eyes[0].iris);
  gl.uniform4f(uniforms.irisB, ...scene.eyes[1].iris);
  gl.uniform2f(uniforms.eyeAngles, scene.eyes[0].angle, scene.eyes[1].angle);
  region('cat', scene.cat.center, scene.cat.radius);
  region('tail', scene.cat.tail, scene.cat.tailRadius);
  region('lamp', scene.lamp.center, scene.lamp.radius);
  region('clock', scene.clock.center, scene.clock.radius);
  region('guitar', scene.guitar.center, scene.guitar.radius);
  region('controller', scene.controller.center, scene.controller.radius);
  region('foot', scene.foot.center, scene.foot.radius);
  gl.uniform2f(uniforms.ankle,...scene.foot.pivot);

  return {
    resize(width, height) {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw({crop, gaze, pupils, tracking = 0, time, motion, blink, pet, lampPulse, footMotion = 0}) {
      gl.uniform4f(uniforms.crop, crop.x, crop.y, crop.width, crop.height);
      const pose = headPose(gaze);
      gl.uniform1f(uniforms.headTilt, pose.tilt);
      gl.uniform2f(uniforms.headShift, ...pose.shift);
      gl.uniform2f(uniforms.pupilA, ...(pupils?.[0] || scene.eyes[0].iris.slice(0, 2)));
      gl.uniform2f(uniforms.pupilB, ...(pupils?.[1] || scene.eyes[1].iris.slice(0, 2)));
      gl.uniform1f(uniforms.tracking, tracking);
      gl.uniform1f(uniforms.time, time); gl.uniform1f(uniforms.motion, motion ? 1 : 0);
      gl.uniform1f(uniforms.blink, blink); gl.uniform1f(uniforms.pet, pet);
      gl.uniform1f(uniforms.lampPulse, lampPulse);
      const foot=footPose(footMotion);
      gl.uniform1f(uniforms.footAngle, foot.angle);
      gl.uniform2f(uniforms.footShift, ...foot.shift);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    destroy() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}
