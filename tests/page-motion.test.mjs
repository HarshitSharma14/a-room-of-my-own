import test from 'node:test';
import assert from 'node:assert/strict';
import { scene } from '../src/scene-config.js';
import { coverCrop } from '../src/scene-math.js';
import { projectPageRect, pageDestination, advancePage, pagePose, pageTiming, footTipOnScreen, magicPoint } from '../src/page-motion.js';

test('the detached sheet starts exactly on its painted position after crop, pan and resize',()=>{
  for(const [width,height,center] of [[1440,813,.56],[390,844,.18],[844,390,.4],[3440,1440,.56]]) {
    const rect={left:15,top:21,width,height}, crop=coverCrop(width,height,...scene.size,center);
    const source=projectPageRect(scene.page.paper,scene,rect,crop), destination=pageDestination(rect);
    const start=pagePose(0,source,destination), end=pagePose(1,source,destination);
    assert.ok(Math.abs(start.cx-source.width/2-source.left)<1e-8);
    assert.ok(Math.abs(start.cy-source.height/2-source.top)<1e-8);
    assert.ok(Math.abs(start.sx*destination.width-source.width)<1e-8);
    assert.ok(Math.abs(start.sy*destination.height-source.height)<1e-8);
    assert.equal(start.angle,0);
    assert.equal(end.cx,rect.left+rect.width/2);assert.equal(end.cy,rect.top+rect.height/2);
    assert.equal(end.sx,1);assert.equal(end.sy,1);assert.ok(Math.abs(end.angle)<1e-8);
    assert.equal(end.copy,1);assert.equal(end.nail.opacity,0);
    assert.ok(destination.left>=rect.left+16);assert.ok(destination.top>=rect.top+20);
  }
});

test('closing during any opening phase returns to the wall without overshooting',()=>{
  for(const fps of [30,60,120]) for(const openingTime of [.05,.4,.8,1.2,1.8,3]) {
    let progress=0;
    for(let frame=0;frame<openingTime*fps;frame++)progress=advancePage(progress,1,1/fps);
    const turnaround=progress;
    for(let frame=0;frame<4*fps;frame++) {
      const previous=progress;progress=advancePage(progress,-1,1/fps);
      assert.ok(progress<=previous&&progress>=0&&progress<=turnaround);
    }
    assert.equal(progress,0);
  }
});

test('paused or reduced-motion users immediately get readable content and immediate return',()=>{
  assert.equal(advancePage(0,1,0,true),1);
  assert.equal(advancePage(.43,1,0,true),1);
  assert.equal(advancePage(1,-1,0,true),0);
  assert.equal(advancePage(.43,-1,0,true),0);
});

test('pin release and readable copy happen in order, and every intermediate pose is finite',()=>{
  const source={left:180,top:290,width:57,height:92};
  const destination={left:400,top:30,width:640,height:760};
  assert.equal(pagePose(.1,source,destination).copy,0);
  const afterImpact=p=>pageTiming.arrival+p*(1-pageTiming.arrival);
  assert.ok(pagePose(afterImpact(.38),source,destination).flight<1e-8);
  assert.ok(pagePose(afterImpact(.54),source,destination).nail.opacity<1e-8);
  assert.equal(pagePose(afterImpact(.54),source,destination).copy,0);
  for(let i=0;i<=180;i++) {
    const pose=pagePose(i/180,source,destination);
    for(const key of ['cx','cy','sx','sy','angle','dim','copy','surface'])assert.ok(Number.isFinite(pose[key]));
    assert.ok(pose.sx>0&&pose.sy>0);
  }
});

test('foot moves first and the nail and page stay fixed until sparkles arrive',()=>{
  const source={left:180,top:290,width:57,height:92}, destination=pageDestination({left:0,top:0,width:1440,height:813});
  const start=pagePose(0,source,destination);
  assert.ok(pagePose(.1,source,destination).footGesture>.5);
  for(let i=0;i<=100;i++) {
    const pose=pagePose(pageTiming.arrival*i/100,source,destination);
    assert.equal(pose.cx,start.cx);assert.equal(pose.cy,start.cy);
    assert.equal(pose.angle,0);assert.equal(pose.flight,0);
    assert.deepEqual(pose.nail,{x:0,y:0,angle:0,opacity:1});
  }
  const final=pagePose(1,source,destination);
  assert.ok(Math.abs(final.footGesture)<1e-8);
});

test('sparkle path starts at the posed toe and ends on the nail after cropping or panning',()=>{
  for(const [width,height,center] of [[1440,813,.56],[390,844,.2],[844,390,.4],[3440,1440,.56]]) {
    const rect={left:12,top:24,width,height},crop=coverCrop(width,height,...scene.size,center);
    const toe=footTipOnScreen(.9,scene,rect,crop), pin=projectPageRect(scene.page.nail,scene,rect,crop);
    const end=[pin.left+pin.width/2,pin.top+pin.height/2];
    assert.deepEqual(magicPoint(pageTiming.launch,toe,end),toe);
    const arrived=magicPoint(pageTiming.arrival,toe,end);
    assert.ok(arrived.every((v,i)=>Math.abs(v-end[i])<1e-8));
    const halfway=magicPoint((pageTiming.launch+pageTiming.arrival)/2,toe,end);
    assert.ok(halfway[1]<(toe[1]+end[1])/2,'Magic must arc above its endpoints');
    assert.notDeepEqual(toe,footTipOnScreen(0,scene,rect,crop));
  }
  // The tip lies in the shader's fully moving core, so its projected location
  // matches the actual foot rather than a partially feathered background point.
  const maskDistance=Math.hypot(...scene.foot.tip.map((v,i)=>(v/scene.size[i]-scene.foot.center[i])/scene.foot.radius[i]));
  assert.ok(maskDistance<.48);
});
