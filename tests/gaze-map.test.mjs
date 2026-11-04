import test from 'node:test';
import assert from 'node:assert/strict';
import { scene } from '../src/scene-config.js';
import { coverCrop, gazeAt, headPose } from '../src/scene-math.js';
import { screenGrid, mapPupils, pupilAt, eyePointOnScreen, eyeMidpointInArtwork, eyeMidpointOnScreen } from '../src/gaze-map.js';

const midpoint = eyeMidpointInArtwork(scene);
const setups = [[1440,813,.56],[1920,1080,.56],[1366,768,.56],[3440,1440,.56],
  [960,960,.56],[390,844,.64],[844,390,.56],[390,844,.78]];
const grid = screenGrid();

function checkDirection(cursor, eye, result, pose, rect, crop) {
  const shown = eyePointOnScreen(result.center, eye, pose, scene, rect, crop);
  const wanted = cursor.map((v,i) => v - result.origin[i]);
  const actual = shown.map((v,i) => v - result.origin[i]);
  if (Math.hypot(...wanted) < 1e-6) return;
  const cross = actual[0] * wanted[1] - actual[1] * wanted[0];
  const dot = actual[0] * wanted[0] + actual[1] * wanted[1];
  assert.ok(dot > 0, 'Pupil must move toward the cursor');
  const error = Math.abs(Math.atan2(cross,dot));
  assert.ok(error < 1e-8, `Gaze angle error: ${error}`);
  const extent = Math.hypot(...result.center.map((v,i) => (v - eye.neutral[i]) / eye.travel[i]));
  assert.ok(extent <= 1.000000001, 'Pupil must remain inside its calibrated travel boundary');
}

test('117 full-screen targets preserve direction for both eyes across eight viewport/crop setups', () => {
  assert.equal(grid.length,117);
  for (const [width,height,center] of setups) {
    const rect={left:21,top:17,width,height};
    const crop=coverCrop(width,height,...scene.size,center);
    for(const point of grid) {
      const cursor=[rect.left+point.u*width,rect.top+point.v*height];
      const pose=headPose(gazeAt(...cursor,rect,crop,midpoint));
      mapPupils(...cursor,pose,scene,rect,crop).forEach((result,i) =>
        checkDirection(cursor,scene.eyes[i],result,pose,rect,crop));
    }
  }
});

test('screen center, lower-middle, and bottom-center all look left and down from the off-center eyes', () => {
  const rect={left:0,top:0,width:1440,height:813};
  const crop=coverCrop(rect.width,rect.height,...scene.size);
  for (const y of [.5,.625,.75,.875,1]) {
    const cursor=[720,y*813], pose=headPose(gazeAt(...cursor,rect,crop,midpoint));
    mapPupils(...cursor,pose,scene,rect,crop).forEach((result,i) => {
      const shown=eyePointOnScreen(result.center,scene.eyes[i],pose,scene,rect,crop);
      assert.ok(shown[0]<result.origin[0], `y=${y}: pupil must look LEFT`);
      assert.ok(shown[1]>result.origin[1], `y=${y}: pupil must look DOWN`);
    });
  }
});

test('each eye centers on its own posed screen position, without retaining the painted rightward bias', () => {
  const rect={left:40,top:25,width:1200,height:900};
  const crop=coverCrop(1200,900,...scene.size,.6), pose=headPose([-.8,.5]);
  for(const eye of scene.eyes) {
    const origin=eyePointOnScreen(eye.neutral,eye,pose,scene,rect,crop);
    assert.deepEqual(pupilAt(...origin,eye,pose,scene,rect,crop).center,eye.neutral);
    assert.notDeepEqual(eye.neutral,eye.iris.slice(0,2));
  }
});

test('the point between the eyes is the shared baseline and both pupils aim inward toward it', () => {
  for(const [width,height,center] of setups) {
    const rect={left:0,top:0,width,height}, crop=coverCrop(width,height,...scene.size,center);
    const pose=headPose([0,0]), baseline=eyeMidpointOnScreen(pose,scene,rect,crop);
    // Skip the head-neutral assertion when a pan places the baseline off screen.
    if(baseline[0]>=0&&baseline[0]<=width&&baseline[1]>=0&&baseline[1]<=height) {
      assert.ok(gazeAt(...baseline,rect,crop,midpoint).every(v=>Math.abs(v)<1e-10));
    }
    const mapped=mapPupils(...baseline,pose,scene,rect,crop);
    mapped.forEach((result,i)=>checkDirection(baseline,scene.eyes[i],result,pose,rect,crop));
    const first=eyePointOnScreen(mapped[0].center,scene.eyes[0],pose,scene,rect,crop);
    const second=eyePointOnScreen(mapped[1].center,scene.eyes[1],pose,scene,rect,crop);
    assert.ok(first[0]>mapped[0].origin[0]);
    assert.ok(second[0]<mapped[1].origin[0]);
  }
});

test('every gaze ray continues moving through its intermediate points to the screen edge', () => {
  const rect={left:0,top:0,width:1440,height:813};
  const crop=coverCrop(1440,813,...scene.size), pose=headPose([-.4,.3]);
  const edges=grid.filter(p=>p.u===0||p.u===1||p.v===0||p.v===1);
  for(const eye of scene.eyes) {
    const origin=eyePointOnScreen(eye.neutral,eye,pose,scene,rect,crop);
    for(const edge of edges) {
      let previous=-1;
      for(let step=0;step<=20;step++) {
        const t=step/20, cursor=[origin[0]+(edge.u*1440-origin[0])*t,origin[1]+(edge.v*813-origin[1])*t];
        const result=pupilAt(...cursor,eye,pose,scene,rect,crop);
        const distance=Math.hypot(...result.center.map((v,i)=>v-eye.neutral[i]));
        assert.ok(distance>previous, 'No dead bands or reversed motion before the edge');
        previous=distance;
      }
    }
  }
});
