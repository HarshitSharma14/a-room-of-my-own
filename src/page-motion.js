import { clamp } from './scene-math.js';

const pageMix = (a,b,t) => a+(b-a)*t;
const pageEase = t => t<=0 ? 0 : t>=1 ? 1 : clamp(t*t*t*(t*(t*6-15)+10),0,1);
const pageRange = (p,a,b) => clamp((p-a)/(b-a),0,1);

export const pageTiming = {duration:3, footStart:.04, footEnd:.24, launch:.15, arrival:.43, sparkleEnd:.61};

export function footPose(amount) {
  const flex=clamp(amount,0,1);
  return {angle:.11*flex,shift:[0,-1.4*flex]};
}

export function footTipOnScreen(amount,scene,rect,crop) {
  const pose=footPose(amount), [x,y]=scene.foot.tip.map((v,i)=>v-scene.foot.pivot[i]*scene.size[i]);
  const c=Math.cos(pose.angle),s=Math.sin(pose.angle);
  const point=[c*x-s*y+scene.foot.pivot[0]*scene.size[0]+pose.shift[0],
    s*x+c*y+scene.foot.pivot[1]*scene.size[1]+pose.shift[1]];
  const projected=projectPageRect([...point,0,0],scene,rect,crop);
  return [projected.left,projected.top];
}

export function magicPoint(progress,start,end,delay=0) {
  const t=pageRange(progress,pageTiming.launch+delay,pageTiming.arrival+delay);
  const arc=Math.min(135,Math.hypot(end[0]-start[0],end[1]-start[1])*.22);
  return [pageMix(start[0],end[0],t),pageMix(start[1],end[1],t)-Math.sin(t*Math.PI)*arc];
}

export function projectPageRect(bounds, scene, rect, crop) {
  const [x,y,width,height]=bounds;
  return {left:rect.left+(x/scene.size[0]-crop.x)/crop.width*rect.width,
    top:rect.top+(y/scene.size[1]-crop.y)/crop.height*rect.height,
    width:width/scene.size[0]/crop.width*rect.width,
    height:height/scene.size[1]/crop.height*rect.height};
}

export function pageDestination(rect) {
  const width=Math.min(640,rect.width-32), height=Math.min(760,rect.height-40);
  return {left:rect.left+(rect.width-width)/2,top:rect.top+(rect.height-height)/2,width,height};
}

// One reversible timeline drives every layer. Reversing midway cannot jump
// the page to a different pose or leave a delayed callback opening it again.
export function advancePage(progress, direction, seconds, still=false) {
  return still ? (direction>0?1:0) : clamp(progress+direction*Math.max(0,seconds)/pageTiming.duration,0,1);
}

export function pagePose(progress, source, destination) {
  // The original page sequence begins only after magic reaches the nail.
  const raw=clamp(progress,0,1), p=pageRange(raw,pageTiming.arrival,1);
  const flight=pageRange(p,.1,1), ease=pageEase(flight);
  const rock=pageRange(p,0,.1);
  const angle=flight>0 ? Math.sin(flight*Math.PI*2)*9*(1-flight)
    : Math.sin(rock*Math.PI*3)*7*Math.sin(rock*Math.PI);
  const sx=pageMix(source.width/destination.width,1,ease);
  const sy=pageMix(source.height/destination.height,1,ease);
  const radians=angle*Math.PI/180;
  // Rock about the upper pin before flying, rather than around the sheet center.
  const hinge=flight===0 ? source.height*.41 : 0;
  const cx=pageMix(source.left+source.width/2,destination.left+destination.width/2,ease)-Math.sin(radians)*hinge;
  const cy=pageMix(source.top+source.height/2,destination.top+destination.height/2,ease)
    -Math.sin(flight*Math.PI)*Math.min(110,destination.height*.16)+(Math.cos(radians)-1)*hinge;
  const lift=pageRange(p,0,.32);
  return {cx,cy,sx,sy,angle,flight,
    surface:pageEase(pageRange(p,.55,.84)), copy:pageEase(pageRange(p,.75,.98)),
    dim:pageEase(pageRange(p,.3,.92))*.66,
    nail:{x:lift===0?0:-Math.sin(lift*Math.PI)*18,y:lift===0?0:-Math.sin(lift*Math.PI)*24+lift*lift*125,
      angle:lift*205+Math.sin(pageRange(p,0,.13)*Math.PI*6)*(lift===0?12:0),
      opacity:1-pageEase(pageRange(p,.18,.32))},
    footGesture:Math.sin(pageRange(raw,pageTiming.footStart,pageTiming.footEnd)*Math.PI),
    state:raw<pageTiming.launch?'foot-cue':raw<pageTiming.arrival?'casting':p===1?'open':p<.02?'impact':p<.1?'loosening':'flying',
  };
}
