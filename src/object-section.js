import { projectPageRect, pageDestination, advancePage, pageTiming, footTipOnScreen, magicPoint } from './page-motion.js';
import { createPageMagic } from './page-magic.js';

const objectSectionContent={
  cat:{title:'A little room to breathe',eyebrow:'THE CAT · 02 / 04',lead:'A quiet companion for a curious mind.',
    body:'The cat is part of the room’s rhythm. A small reaction, a moment of rest, and then back to making things. This corner is a reminder that good work also needs room to pause.',
    detail:'Try petting the cat again after closing this note.',label:'The cat',bounds:[1038,744,272,145]},
  laptop:{title:'Things I’m building',eyebrow:'THE LAPTOP · 03 / 04',lead:'Projects live behind this screen.',
    body:'A room of my own is the first project on display: a single illustrated scene with pointer tracking, gentle motion, and objects that open into stories.',
    detail:'Built with browser-native JavaScript, WebGL, and an artwork-led interaction system. More work can be added here as the portfolio grows.',label:'The laptop',bounds:[1410,630,265,260]},
  guitar:{title:'Beyond the screen',eyebrow:'THE GUITAR · 04 / 04',lead:'A space for interests and ideas.',
    body:'This corner of the portfolio is for the things that keep creativity moving outside a project brief. It can hold music, experiments, photos, and whatever comes next.',
    detail:'The room is still growing. This section is ready for personal stories and work you want to share.',label:'The guitar',bounds:[2255,565,205,445]},
};

export function createObjectSection({id,room,button,scene,image,getView,getFootMotion,isStill,onChange,onCue}){
  const content=objectSectionContent[id];
  const isLaptop=id==='laptop';
  const dialog=document.createElement('dialog');
  dialog.className=`object-dialog object-dialog--${id}`;dialog.id=`${id}-dialog`;
  dialog.setAttribute('aria-labelledby',`${id}-title`);
  const panelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      ${isLaptop?'<div class="laptop-toolbar" aria-hidden="true"><span class="laptop-led"></span><span>HARSHIT / PROJECTS</span><span>01 — 01</span></div>':''}
      <span class="object-eyebrow"></span><h2 id="${id}-title"></h2>
      <p class="object-lead"></p><p class="object-body"></p><div class="object-rule"></div><p class="object-detail"></p>
      <span class="object-footer">A ROOM OF MY OWN</span>`;
  const panelHTML=`<article class="object-panel" tabindex="0" aria-label="${content.label} section">${isLaptop?`<div class="laptop-screen-content">${panelBody}</div>`:panelBody}</article>`;
  dialog.innerHTML=`<button class="object-backdrop" type="button" tabindex="-1" aria-label="Close ${content.label} section"></button>
    <canvas class="object-magic" aria-hidden="true"></canvas>
    ${isLaptop?`<div class="object-traveler object-laptop"><div class="laptop-machine"><div class="laptop-lid">${panelHTML}</div><div class="laptop-base" aria-hidden="true"><div class="laptop-keyboard"></div><div class="laptop-trackpad"></div></div></div></div>`
      :`<div class="object-traveler" aria-hidden="true"><div class="object-portrait"></div></div>${panelHTML}`}`;
  for(const [selector,value] of [['.object-eyebrow',content.eyebrow],['h2',content.title],['.object-lead',content.lead],['.object-body',content.body],['.object-detail',content.detail]]) dialog.querySelector(selector).textContent=value;
  document.body.append(dialog);
  const traveler=dialog.querySelector('.object-traveler'), portrait=dialog.querySelector('.object-portrait');
  const machine=dialog.querySelector('.laptop-machine');
  const screenContent=dialog.querySelector('.laptop-screen-content');
  const panel=dialog.querySelector('.object-panel'), backdrop=dialog.querySelector('.object-backdrop');
  const magic=createPageMagic(dialog.querySelector('.object-magic'));
  if(portrait)portrait.style.backgroundImage=`url("${image.currentSrc||image.src}")`;
  const closeButton=dialog.querySelector('.object-close');
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);button.setAttribute('aria-expanded','false');
  button.dataset.label=id==='cat'?'The cat':id==='laptop'?'Projects':'Beyond code';
  let active=false,progress=0,direction=1,frame=0,last=0,focus=null;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const ease=value=>value*value*(3-2*value);
  function render(){
    const {rect,crop}=getView(),source=projectPageRect(content.bounds,scene,rect,crop);
    const insetX=Math.min(12,rect.width*.025),insetY=Math.min(12,rect.height*.025);
    const destination=isLaptop?{left:rect.left+insetX,top:rect.top+insetY,width:rect.width-2*insetX,height:rect.height-2*insetY}:pageDestination(rect);
    const t=ease(clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1));
    const cx=source.left+source.width/2+(destination.left+destination.width/2-source.left-source.width/2)*t;
    const cy=source.top+source.height/2+(destination.top+destination.height/2-source.top-source.height/2)*t;
    const width=source.width+(destination.width-source.width)*t;
    const height=source.height+(destination.height-source.height)*t;
    Object.assign(traveler.style,{left:`${cx-width/2}px`,top:`${cy-height/2}px`,width:`${width}px`,height:`${height}px`,
      opacity:isLaptop?String(progress>=pageTiming.arrival?1:0):String(clamp(1-(progress-.63)/.25,0,1)),
      transform:isLaptop?'none':`rotate(${(id==='guitar'?8:-4)*Math.sin(t*Math.PI)}deg)`,
      pointerEvents:isLaptop&&progress>.85?'auto':'none'});
    if(machine){
      const turn=ease(clamp((progress-pageTiming.arrival)/(.9-pageTiming.arrival),0,1));
      machine.style.transform=`rotateY(${54*(1-turn)}deg) rotateX(${-9*(1-turn)}deg) rotateZ(${-8*(1-turn)}deg)`;
      traveler.style.setProperty('--base-height',`${Math.min(74,Math.max(43,height*.12))}px`);
      screenContent.style.opacity=String(ease(clamp((progress-.61)/.3,0,1)));
    }else{
      const imageWidth=rect.width/crop.width,imageHeight=rect.height/crop.height;
      portrait.style.backgroundSize=`${imageWidth}px ${imageHeight}px`;
      portrait.style.backgroundPosition=`${-(source.left-rect.left+crop.x*imageWidth)}px ${-(source.top-rect.top+crop.y*imageHeight)}px`;
      portrait.style.width=`${source.width}px`;portrait.style.height=`${source.height}px`;
      portrait.style.transform=`scale(${width/source.width},${height/source.height})`;
    }
    panel.style.opacity=isLaptop?'1':String(ease(clamp((progress-.66)/.34,0,1)));
    if(!isLaptop)panel.style.transform=`translateY(${(1-t)*28}px) scale(${.94+.06*t})`;
    panel.style.pointerEvents=progress>.85?'auto':'none';
    backdrop.style.opacity=String(progress*.75);
    const center=[source.left+source.width/2,source.top+source.height/2];
    const toe=footTipOnScreen(getFootMotion(),scene,rect,crop);
    magic.draw(progress,toe,center,rect,direction>0&&!isStill());
    focus=direction>0&&progress<pageTiming.arrival?magicPoint(progress,toe,center):[cx,cy];
    room.dataset.section=id;onChange();
  }
  function finishClose(){
    active=false;progress=0;focus=null;last=0;dialog.close();delete room.dataset.section;
    button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});onChange();
  }
  function tick(now){
    frame=0;if(!active||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,.25):0;last=now;
    progress=advancePage(progress,direction,dt*1.3,isStill());
    render();
    if(direction<0&&progress===0){finishClose();return;}
    if(direction>0&&progress===1){last=0;return;}
    frame=requestAnimationFrame(tick);
  }
  function schedule(){if(active&&!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function open(){
    if(active)return;active=true;direction=1;progress=isStill()?1:0;last=0;
    button.setAttribute('aria-expanded','true');panel.scrollTop=0;
    dialog.showModal();onCue(id);render();closeButton.focus({preventScroll:true});schedule();
  }
  function close(){if(!active||direction<0)return;direction=-1;last=0;schedule();}
  button.addEventListener('click',open);
  closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  addEventListener('resize',()=>{if(active)render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;if(active)finishClose();});
  return {get active(){return active;},getFocus(){return focus;},
    getFootGesture(){return active&&direction>0?Math.sin(clamp((progress-pageTiming.footStart)/(pageTiming.footEnd-pageTiming.footStart),0,1)*Math.PI):0;}};
}
