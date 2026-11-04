import test from 'node:test';
import assert from 'node:assert/strict';
import { coverCrop, damp, gazeAt, blinkAt, headPose } from '../src/scene-math.js';

test('cover never exposes blank edges in portrait, wide, or square viewports', () => {
  for (const [w,h] of [[390,844],[1920,1080],[3440,1440],[800,800]]) {
    for (const center of [-1, 0, .5, 1, 2]) {
      const c = coverCrop(w,h,2752,1536,center);
      assert.ok(c.x >= 0 && c.y >= 0);
      assert.ok(c.x+c.width <= 1.000001 && c.y+c.height <= 1.000001);
      assert.ok(Math.abs((c.width*2752)/(c.height*1536) - w/h) < 1e-8);
    }
  }
});

test('motion settles at the same position at 30Hz and 120Hz', () => {
  function simulate(fps) { let x=0; for(let i=0;i<fps;i++) x=damp(x,1,7,1/fps); return x; }
  assert.ok(Math.abs(simulate(30)-simulate(120))<1e-10);
});

test('gaze accounts for the visible crop after panning', () => {
  const rect={left:20,top:10,width:400,height:800};
  const crop={x:.5,y:0,width:.25,height:1};
  assert.deepEqual(gazeAt(220,410,rect,crop,[.625,.5]),[0,0]);
  const gaze=gazeAt(-1000,10000,rect,crop,[.625,.5]);
  assert.ok(gaze.every(x=>x>=-1&&x<=1));
});

test('gaze keeps following across the whole left side instead of saturating near the middle', () => {
  const rect = {left: 0, top: 0, width: 1440, height: 900};
  const crop = {x: 0, y: 0, width: 1, height: 1};
  const face = [.7, .5];
  const positions = [0, 144, 288, 432, 576, 720, 864, 1008];
  const values = positions.map(x => gazeAt(x, 450, rect, crop, face)[0]);
  assert.equal(values[0], -1);
  assert.ok(Math.abs(values.at(-1)) < 1e-10);
  for (let i = 1; i < values.length; i++) assert.ok(values[i] > values[i - 1]);
  assert.equal(gazeAt(1440, 450, rect, crop, face)[0], 1);
});

test('gaze reaches both visible edges after cropping and stays centered on the face', () => {
  const rect = {left: 80, top: 40, width: 800, height: 600};
  const crop = {x: .3, y: .1, width: .5, height: .7};
  const face = [.65, .45];
  const left = gazeAt(80, 340, rect, crop, face);
  const right = gazeAt(880, 340, rect, crop, face);
  assert.equal(left[0], -1);
  assert.equal(right[0], 1);
  assert.ok(Math.abs(left[1]) < 1e-10 && Math.abs(right[1]) < 1e-10);
  assert.ok(gazeAt(480, 340, rect, crop, face)[0] > -1);
});

test('extreme-left gaze turns the neck progressively while the center stays relaxed', () => {
  assert.deepEqual(headPose([0, 0]), {tilt: 0, shift: [0, 0]});
  const mid = headPose([-.5, 0]), far = headPose([-1, 0]);
  assert.ok(far.tilt < mid.tilt && far.shift[0] < mid.shift[0]);
  assert.ok(Math.abs(far.tilt) > 3 * Math.abs(mid.tilt));
  assert.ok(Math.abs(far.tilt) < Math.PI / 30);
});

test('blinking closes briefly and always returns to open', () => {
  assert.equal(blinkAt(1,2),0);
  assert.equal(blinkAt(2.1,2),1);
  assert.equal(blinkAt(3,2),0);
  for(let t=0;t<4;t+=.01) assert.ok(blinkAt(t,2)>=0&&blinkAt(t,2)<=1);
});
