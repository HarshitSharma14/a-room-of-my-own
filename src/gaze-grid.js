import { screenGrid, eyePointOnScreen, eyeMidpointOnScreen } from './gaze-map.js';

// Opt-in calibration UI. The normal portfolio has no grid or debug panel.
export function createGazeGrid(scene, onChange) {
  const points = screenGrid();
  const baseline = {id:'Between eyes', baseline:true};
  let pinned = baseline;
  const style = document.createElement('style');
  style.textContent = `
    .gaze-grid{position:fixed;inset:0;pointer-events:none;z-index:10;color:#f5eedf;font:12px/1.45 system-ui}
    .gaze-grid svg{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}
    .gaze-point{position:absolute;transform:translate(-50%,-50%);width:36px;height:36px;border:0;background:none;pointer-events:auto;cursor:crosshair;color:#ceebf0;font-size:9px;padding:0}
    .gaze-point:before{content:'';display:block;width:5px;height:5px;background:#bcdee2bd;border-radius:50%;margin:0 auto 2px;box-shadow:0 0 2px #18242c}
    .gaze-point:hover,.gaze-point:focus-visible,.gaze-point[aria-pressed=true]{color:#ffe2a9;outline:1px solid #ffe2a9;border-radius:50%;background:#14232ca8}
    .gaze-panel{position:absolute;left:18px;top:18px;width:300px;padding:15px;background:#142029f2;border:1px solid #83a7ad55;border-radius:10px;pointer-events:auto;box-shadow:0 10px 40px #0004}
    .gaze-panel h2{margin:0 0 5px;font-size:16px;font-weight:600}.gaze-panel p{margin:6px 0;color:#c8d4d4}
    .gaze-panel label{display:block;margin-top:9px}.gaze-panel select{width:100%;margin-top:4px;background:#263943;color:#eef3e9;border:1px solid #607b83;border-radius:5px;padding:6px}
    .gaze-controls{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0}.gaze-controls button,.gaze-collapse{border:1px solid #647e83;color:#eaf0e6;background:#2a414a;padding:6px 8px;border-radius:5px;cursor:pointer}
    .gaze-panel canvas{width:100%;height:auto;display:block;border-radius:5px;background:#202b37}
    .gaze-readout{display:block;margin-top:8px;font-variant-numeric:tabular-nums;white-space:pre-line;min-height:64px}
    .gaze-collapse{position:absolute;top:10px;right:10px;font-size:11px}.gaze-panel[data-collapsed=true] .gaze-details{display:none}
    @media(max-width:650px){.gaze-panel{width:235px;left:10px;top:10px;font-size:11px}.gaze-point{font-size:8px}}
  `;
  document.head.append(style);
  const root = document.createElement('aside');
  root.className = 'gaze-grid';
  root.setAttribute('aria-label', 'Eye tracking calibration grid');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  for (const [axis,count] of [['x',13],['y',9]]) {
    for(let i=0;i<count;i++) {
      const line=document.createElementNS(ns,'line'), percent=`${i/(count-1)*100}%`;
      for(const [name,value] of Object.entries(axis==='x'?{x1:percent,x2:percent,y1:'0%',y2:'100%'}:{y1:percent,y2:percent,x1:'0%',x2:'100%'})) line.setAttribute(name,value);
      line.setAttribute('stroke','#bedbdf');line.setAttribute('stroke-opacity','.16');svg.append(line);
    }
  }
  const rays=document.createElementNS(ns,'path');
  rays.setAttribute('stroke','#ffe3a1');rays.setAttribute('stroke-width','1.2');rays.setAttribute('fill','none');svg.append(rays);
  const dots=[0,1,2,3].map(i=>{
    const dot=document.createElementNS(ns,'circle');dot.setAttribute('r',i===2?'7':i===3?'6':'4');
    dot.setAttribute('stroke',i===2?'#ffe3a1':i===3?'#e9a7ff':'#9dedeb');dot.setAttribute('fill','none');svg.append(dot);return dot;
  });
  const midpointLabel=document.createElementNS(ns,'text');midpointLabel.textContent='eye midpoint';
  midpointLabel.setAttribute('fill','#edcaff');midpointLabel.setAttribute('font-size','12');svg.append(midpointLabel);
  root.append(svg);
  const buttons=points.map(point=>{
    const button=document.createElement('button');button.className='gaze-point';button.type='button';
    button.style.left=`${point.u*100}%`;button.style.top=`${point.v*100}%`;button.textContent=point.id;
    button.setAttribute('aria-label',`Grid ${point.id}: x ${Math.round(point.u*100)} percent, y ${Math.round(point.v*100)} percent`);
    button.addEventListener('click',()=>select(point));root.append(button);return button;
  });
  const panel=document.createElement('section');panel.className='gaze-panel';
  panel.innerHTML=`<h2>Eye tracking grid</h2><button class="gaze-collapse" type="button">Hide panel</button>
    <div class="gaze-details"><p>117 screen points. Purple marks the midpoint between the eyes—the baseline. Gold lines aim at the selected target.</p>
    <label>Grid point<select aria-label="Choose gaze grid point"></select></label>
    <div class="gaze-controls"><button type="button" data-baseline>Between eyes</button><button type="button" data-point="G5">Screen center</button><button type="button" data-point="G7">Lower middle</button><button type="button" data-point="G9">Bottom center</button><button type="button" data-follow>Follow cursor</button></div>
    <canvas width="680" height="520" aria-label="Live enlarged view of the rendered eyes and head"></canvas><output class="gaze-readout"></output></div>`;
  root.append(panel);document.body.append(root);
  const selector=panel.querySelector('select');
  for(const point of points) {
    const option=document.createElement('option');option.value=point.id;
    option.textContent=`${point.id} · x ${(point.u*100).toFixed(1)}%, y ${(point.v*100).toFixed(1)}%`;selector.append(option);
  }
  selector.addEventListener('change',()=>select(points.find(p=>p.id===selector.value)));
  panel.querySelectorAll('[data-point]').forEach(button=>button.addEventListener('click',()=>select(points.find(p=>p.id===button.dataset.point))));
  panel.querySelector('[data-follow]').addEventListener('click',()=>select(null));
  panel.querySelector('[data-baseline]').addEventListener('click',()=>select(baseline));
  const collapse=panel.querySelector('.gaze-collapse');
  collapse.addEventListener('click',()=>{const hidden=panel.dataset.collapsed!=='true';panel.dataset.collapsed=String(hidden);collapse.textContent=hidden?'Show panel':'Hide panel';});
  const zoom=panel.querySelector('canvas'), ctx=zoom.getContext('2d');
  const readout=panel.querySelector('output');
  function select(point) {
    pinned=point;
    selector.value=point?.id || '';
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(points[i]===point)));
    onChange();
  }
  select(pinned);
  let previousUpdate=0;
  return {
    getTarget(rect,crop) {return pinned?.baseline ? eyeMidpointOnScreen({tilt:0,shift:[0,0]},scene,rect,crop)
      : pinned ? [rect.left+pinned.u*rect.width,rect.top+pinned.v*rect.height] : null;},
    update({rect,crop,pose,pupils,canvas,cursor,renderer}) {
      const now=performance.now();if(now-previousUpdate<32)return;previousUpdate=now;
      const origins=scene.eyes.map(eye=>eyePointOnScreen(eye.neutral,eye,pose,scene,rect,crop));
      const local=point=>[point[0]-rect.left,point[1]-rect.top];
      rays.setAttribute('d',cursor?origins.map(p=>`M${local(p).join(',')}L${local(cursor).join(',')}`).join(' '):'');
      const midpoint=eyeMidpointOnScreen(pose,scene,rect,crop);
      [...origins,cursor,midpoint].forEach((point,i)=>{dots[i].style.display=point?'':'none';if(point){const p=local(point);dots[i].setAttribute('cx',p[0]);dots[i].setAttribute('cy',p[1]);}});
      midpointLabel.setAttribute('x',local(midpoint)[0]+10);midpointLabel.setAttribute('y',local(midpoint)[1]-10);
      if(renderer && ctx && panel.dataset.collapsed!=='true') {
        const sx=(1750/scene.size[0]-crop.x)/crop.width*canvas.width;
        const sy=(600/scene.size[1]-crop.y)/crop.height*canvas.height;
        const sw=340/scene.size[0]/crop.width*canvas.width, sh=260/scene.size[1]/crop.height*canvas.height;
        ctx.clearRect(0,0,zoom.width,zoom.height);ctx.drawImage(canvas,sx,sy,sw,sh,0,0,zoom.width,zoom.height);
      }
      if(!cursor) {readout.textContent='Move the cursor into the room.';return;}
      const direction=origins.map((p,i)=>{
        const shown=eyePointOnScreen(pupils[i],scene.eyes[i],pose,scene,rect,crop);
        const dx=shown[0]-p[0],dy=shown[1]-p[1];
        return `Eye ${i+1}: ${dx<0?'left':'right'} ${Math.abs(dx).toFixed(2)}px · ${dy<0?'up':'down'} ${Math.abs(dy).toFixed(2)}px`;
      });
      readout.textContent=`${pinned?`${pinned.id} · held point`:'Following cursor'} · ${Math.round(cursor[0]-rect.left)}, ${Math.round(cursor[1]-rect.top)}px\n${direction.join('\n')}\n${renderer?'Live WebGL close-up':'Still-image fallback — animation unavailable'}`;
    },
  };
}
