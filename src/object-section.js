import { projectPageRect, pageDestination, advancePage, pageTiming, footTipOnScreen, magicPoint } from './page-motion.js';
import { createPageMagic } from './page-magic.js';

const objectSectionContent={
  cat:{title:'A little room to breathe',eyebrow:'THE CAT · 02 / 06',lead:'A quiet companion for a curious mind.',
    body:'The cat is part of the room’s rhythm. A small reaction, a moment of rest, and then back to making things. This corner is a reminder that good work also needs room to pause.',
    detail:'Try petting the cat again after closing this note.',label:'The cat',bounds:[1038,744,272,145]},
  laptop:{title:'Things I’m building',eyebrow:'THE LAPTOP · 03 / 06',lead:'Projects live behind this screen.',
    body:'A room of my own is the first project on display: a single illustrated scene with pointer tracking, gentle motion, and objects that open into stories.',
    detail:'Built with browser-native JavaScript, WebGL, and an artwork-led interaction system. More work can be added here as the portfolio grows.',label:'The laptop',bounds:[1410,630,265,260]},
  guitar:{title:'Beyond the screen',eyebrow:'THE GUITAR · 04 / 06',lead:'A space for interests and ideas.',
    body:'This corner of the portfolio is for the things that keep creativity moving outside a project brief. It can hold music, experiments, photos, and whatever comes next.',
    detail:'The room is still growing. This section is ready for personal stories and work you want to share.',label:'The guitar',bounds:[2255,565,205,445]},
  book:{title:'The next chapter',eyebrow:'THE BOOK · 05 / 06',lead:'A place for what I’m learning.',
    body:'This book is a space for notes, experiments, and ideas that turn into work. Each chapter can hold a skill, a project, and what changed after trying it.',
    detail:'The pages are ready for real examples as this portfolio grows.',label:'The book',bounds:[1330,1420,275,116]},
};

export function createObjectSection({id,room,button,scene,image,getView,getFootMotion,isStill,onChange,onCue}){
  const content=objectSectionContent[id];
  const isLaptop=id==='laptop';
  const isCat=id==='cat';
  const isBook=id==='book';
  const patchArt={laptop:{file:'laptop-sofa-patch.png',bounds:[1320,560,480,430]},cat:{file:'cat-sofa-patch.png',bounds:[940,680,470,390]},book:{file:'book-floor-patch.png',bounds:[1150,1210,650,326]}}[id];
  const roomPatch=patchArt?document.createElement('img'):null;
  if(roomPatch){roomPatch.src=`./art/${patchArt.file}`;roomPatch.alt='';roomPatch.className=`${id}-room-patch`;roomPatch.hidden=true;room.append(roomPatch);}
  const dialog=document.createElement('dialog');
  dialog.className=`object-dialog object-dialog--${id}`;dialog.id=`${id}-dialog`;
  dialog.setAttribute('aria-labelledby',`${id}-title`);
  const panelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      ${isLaptop?'<div class="laptop-toolbar" aria-hidden="true"><span class="laptop-led"></span><span>HARSHIT / PROJECTS</span></div>':''}
      <span class="object-eyebrow"></span><h2 id="${id}-title"></h2>
      <p class="object-lead"></p><p class="object-body"></p><div class="object-rule"></div><p class="object-detail"></p>
      <span class="object-footer">A ROOM OF MY OWN</span>`;
  const catPanelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      <div class="wispr-header-badge" aria-hidden="true">
        <img src="./art/wispr-flow-icon-light.png" alt="" class="wispr-header-icon" />
        <span class="wispr-header-title">WISPR FLOW VOICE DICTATION</span>
      </div>
      <span class="object-eyebrow">${content.eyebrow}</span>
      <h2 id="${id}-title">Spoken into reality</h2>
      <div class="wispr-speech-box">
        <div class="wispr-icon-wrap" aria-hidden="true">
          <img src="./art/wispr-flow-icon-light.png" alt="" />
          <span class="wispr-pulse-ring"></span>
        </div>
        <div class="wispr-word-flow" id="cat-speech-output" aria-live="polite"></div>
      </div>
      <div class="object-rule"></div>
      <p class="object-detail">Wispr Flow transformed Harshit's spoken thoughts into the code, copy, and interactions of this room.</p>
      <span class="object-footer">A ROOM OF MY OWN</span>`;
  const panelHTML=`<article class="object-panel" tabindex="0" aria-label="${content.label} section">${isLaptop?`<div class="laptop-screen-content">${panelBody}</div>`:isCat?catPanelBody:panelBody}</article>`;
  dialog.innerHTML=`<button class="object-backdrop" type="button" tabindex="-1" aria-label="Close ${content.label} section"></button>
    ${isLaptop||isBook?'':'<canvas class="object-magic" aria-hidden="true"></canvas>'}
    ${isLaptop?`<div class="object-traveler object-laptop"><div class="laptop-machine"><img class="laptop-front" src="./art/laptop-front.png" alt="" draggable="false">${panelHTML}</div></div>`
      :isCat?`<div class="object-traveler object-cat" aria-hidden="true"><img class="cat-front cat-front--closed" src="./art/cat-front.png" alt="" draggable="false"><img class="cat-front cat-front--talking" src="./art/cat-front-talking.png" alt="" draggable="false" style="display:none;"></div>${panelHTML}`
      :isBook?`<div class="object-traveler object-book" aria-hidden="true"><img class="book-open" src="./art/book-open.png" alt="" draggable="false"><div class="book-cover"><img class="book-front" src="./art/book-front.png" alt="" draggable="false"></div></div>${panelHTML}`
      :`<div class="object-traveler" aria-hidden="true"><div class="object-portrait"></div></div>${panelHTML}`}`;
  if(!isCat){
    for(const [selector,value] of [['.object-eyebrow',content.eyebrow],['h2',content.title],['.object-lead',content.lead],['.object-body',content.body],['.object-detail',content.detail]]) dialog.querySelector(selector).textContent=value;
  }
  document.body.append(dialog);
  const traveler=dialog.querySelector('.object-traveler'), portrait=dialog.querySelector('.object-portrait');
  const machine=dialog.querySelector('.laptop-machine');
  const screenContent=dialog.querySelector('.laptop-screen-content');
  const bookOpen=dialog.querySelector('.book-open'),bookCover=dialog.querySelector('.book-cover');
  const panel=dialog.querySelector('.object-panel'), backdrop=dialog.querySelector('.object-backdrop');
  const magic=isLaptop||isBook?null:createPageMagic(dialog.querySelector('.object-magic'));
  if(portrait)portrait.style.backgroundImage=`url("${image.currentSrc||image.src}")`;
  const closeButton=dialog.querySelector('.object-close');
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);button.setAttribute('aria-expanded','false');
  button.dataset.label=id==='cat'?'The cat':id==='laptop'?'Projects':id==='book'?'The book':'Beyond code';
  let active=false,progress=0,direction=1,frame=0,last=0,focus=null;
  let catSpeechTimer=null,catMouthTimer=null,catAutoReturnTimer=null,catSpeaking=false;
  const catClosedImg=isCat?dialog.querySelector('.cat-front--closed'):null;
  const catTalkingImg=isCat?dialog.querySelector('.cat-front--talking'):null;
  const catSpeechOutput=isCat?dialog.querySelector('#cat-speech-output'):null;
  const catWisprWrap=isCat?dialog.querySelector('.wispr-icon-wrap'):null;

  function stopCatSpeech(){
    if(catSpeechTimer){clearInterval(catSpeechTimer);catSpeechTimer=null;}
    if(catMouthTimer){clearInterval(catMouthTimer);catMouthTimer=null;}
    if(catAutoReturnTimer){clearTimeout(catAutoReturnTimer);catAutoReturnTimer=null;}
    catSpeaking=false;
    if(catClosedImg)catClosedImg.style.display='block';
    if(catTalkingImg)catTalkingImg.style.display='none';
    if(catWisprWrap)catWisprWrap.classList.remove('is-speaking');
  }

  function startCatSpeech(){
    if(!isCat||catSpeaking)return;
    stopCatSpeech();
    catSpeaking=true;
    if(catSpeechOutput)catSpeechOutput.innerHTML='';
    if(catWisprWrap)catWisprWrap.classList.add('is-speaking');

    const speechText="Meow! Harshit built this entire room using Wispr Flow. Instead of typing every line of code, he just spoke his thoughts out loud — and Wispr Flow turned his voice into fluid code, interactive logic, and stories. Every interaction in this room started as a spoken idea!";
    const words=speechText.split(' ');
    let wordIndex=0;

    let mouthOpen=false;
    catMouthTimer=setInterval(()=>{
      if(!catSpeaking)return;
      mouthOpen=!mouthOpen;
      if(catClosedImg)catClosedImg.style.display=mouthOpen?'none':'block';
      if(catTalkingImg)catTalkingImg.style.display=mouthOpen?'block':'none';
    },140);

    catSpeechTimer=setInterval(()=>{
      if(!catSpeaking)return;
      if(wordIndex<words.length){
        const word=words[wordIndex++];
        const span=document.createElement('span');
        span.className='wispr-word wispr-word-latest';
        span.textContent=word;
        const prevLatest=catSpeechOutput.querySelector('.wispr-word-latest');
        if(prevLatest&&prevLatest!==span)prevLatest.classList.remove('wispr-word-latest');
        catSpeechOutput.append(span);
        catSpeechOutput.scrollTop=catSpeechOutput.scrollHeight;
      }else{
        if(catSpeechTimer){clearInterval(catSpeechTimer);catSpeechTimer=null;}
        if(catMouthTimer){clearInterval(catMouthTimer);catMouthTimer=null;}
        if(catClosedImg)catClosedImg.style.display='block';
        if(catTalkingImg)catTalkingImg.style.display='none';
        if(catWisprWrap)catWisprWrap.classList.remove('is-speaking');
        catAutoReturnTimer=setTimeout(()=>{
          if(active&&direction>0)close();
        },1800);
      }
    },170);
  }

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const ease=value=>value*value*(3-2*value);
  function render(){
    const {rect,crop}=getView(),source=projectPageRect(content.bounds,scene,rect,crop);
    if(roomPatch){
      const bounds=projectPageRect(patchArt.bounds,scene,rect,crop);
      Object.assign(roomPatch.style,{left:`${bounds.left}px`,top:`${bounds.top}px`,width:`${bounds.width}px`,height:`${bounds.height}px`});
      roomPatch.hidden=isCat&&progress<pageTiming.arrival;
    }
    const finalWidth=Math.max(rect.width*1.15,rect.height*1.78),finalHeight=finalWidth*1086/1448;
    const destination=isLaptop?{left:rect.left+(rect.width-finalWidth)/2,top:rect.top+rect.height*.6-finalHeight/2,width:finalWidth,height:finalHeight}:pageDestination(rect);
    const starting=isLaptop?{left:source.left,top:source.top+(source.height-source.width*1086/1448)/2,width:source.width,height:source.width*1086/1448}:source;
    const t=ease(clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1));
    let cx=starting.left+starting.width/2+(destination.left+destination.width/2-starting.left-starting.width/2)*t;
    let cy=starting.top+starting.height/2+(destination.top+destination.height/2-starting.top-starting.height/2)*t;
    let width=starting.width+(destination.width-starting.width)*t;
    let height=starting.height+(destination.height-starting.height)*t;
    let bookFlight=0;
    if(isCat){
      const aspect=1312/1199,phase=clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1);
      const fly=ease(clamp(phase,0,1));
      const startWidth=source.height*aspect;
      const isMobile=rect.width<=700;
      const targetWidth=isMobile?Math.min(rect.width*.44,rect.height*.38*aspect):Math.min(rect.width*.36,rect.height*.52*aspect);
      width=startWidth+(targetWidth-startWidth)*fly;
      height=width/aspect;
      const startCx=source.left+source.width/2,startCy=source.top+source.height/2;
      const targetCx=isMobile?rect.left+rect.width*.3:rect.left+rect.width*.22;
      const targetCy=isMobile?rect.top+rect.height*.3:rect.top+rect.height*.52;
      cx=startCx+(targetCx-startCx)*fly;
      cy=startCy+(targetCy-startCy)*fly;
    }
    if(isBook){
      const closedAspect=1115/1410,openAspect=1536/1024;
      const phase=clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1);
      const fly=ease(clamp(phase/.46,0,1)),opening=ease(clamp((phase-.46)/.32,0,1)),approach=ease(clamp((phase-.78)/.22,0,1));
      const startWidth=source.width*.7,midClosedWidth=Math.min(rect.width*.44,rect.height*.62*closedAspect);
      const midOpenWidth=Math.min(rect.width*.9,rect.height*.9*openAspect);
      const finalOpenWidth=Math.max(rect.width*1.1,rect.height*openAspect);
      width=startWidth+(midClosedWidth-startWidth)*fly+(midOpenWidth-midClosedWidth)*opening+(finalOpenWidth-midOpenWidth)*approach;
      height=startWidth/closedAspect+(midClosedWidth-startWidth)/closedAspect*fly+(midOpenWidth/openAspect-midClosedWidth/closedAspect)*opening+(finalOpenWidth-midOpenWidth)/openAspect*approach;
      cx=source.left+source.width/2+(rect.left+rect.width/2-source.left-source.width/2)*fly;
      cy=source.top+source.height/2+(rect.top+rect.height/2-source.top-source.height/2)*fly;
      bookFlight=fly;
      bookOpen.style.opacity=String(opening);
      bookOpen.style.transform=`scaleX(${.55+.45*opening})`;
      const coverWidth=startWidth+(midClosedWidth-startWidth)*fly;
      Object.assign(bookCover.style,{width:`${coverWidth}px`,height:`${coverWidth/closedAspect}px`,opacity:String(1-opening),transform:`translate(-50%,-50%) rotateY(${-100*opening}deg)`});
    }
    Object.assign(traveler.style,{left:`${cx-width/2}px`,top:`${cy-height/2}px`,width:`${width}px`,height:`${height}px`,
      opacity:isLaptop||isCat||isBook?String(progress>=pageTiming.arrival?1:0):String(clamp(1-(progress-.63)/.25,0,1)),
      transform:isBook?`perspective(1000px) rotateX(${55*(1-bookFlight)}deg) rotateZ(${-16*(1-bookFlight)}deg)`:isLaptop||isCat?'none':`rotate(${8*Math.sin(t*Math.PI)}deg)`,
      pointerEvents:isLaptop&&progress>.85?'auto':'none'});
    if(machine){
      const turn=ease(clamp((progress-pageTiming.arrival)/(.9-pageTiming.arrival),0,1));
      machine.style.transform=`rotateY(${54*(1-turn)}deg) rotateX(${-9*(1-turn)}deg) rotateZ(${-8*(1-turn)}deg)`;
      screenContent.style.opacity=String(ease(clamp((progress-.61)/.3,0,1)));
    }else if(portrait){
      const imageWidth=rect.width/crop.width,imageHeight=rect.height/crop.height;
      portrait.style.backgroundSize=`${imageWidth}px ${imageHeight}px`;
      portrait.style.backgroundPosition=`${-(source.left-rect.left+crop.x*imageWidth)}px ${-(source.top-rect.top+crop.y*imageHeight)}px`;
      portrait.style.width=`${source.width}px`;portrait.style.height=`${source.height}px`;
      portrait.style.transform=`scale(${width/source.width},${height/source.height})`;
    }
    panel.style.opacity=isLaptop?'1':String(ease(clamp((progress-(isCat||isBook?.8:.66))/(isCat||isBook?.2:.34),0,1)));
    if(!isLaptop)panel.style.transform=isBook?'translateY(-50%)':isCat?'translateY(-50%)':`translateY(${(1-t)*28}px) scale(${.94+.06*t})`;
    panel.style.pointerEvents=progress>.85?'auto':'none';
    backdrop.style.opacity=String(progress*.75);
    const center=[source.left+source.width/2,source.top+source.height/2];
    const toe=footTipOnScreen(getFootMotion(),scene,rect,crop);
    magic?.draw(progress,toe,center,rect,direction>0&&!isStill());
    focus=direction>0&&progress<pageTiming.arrival?magicPoint(progress,toe,center):[cx,cy];
    room.dataset.section=id;onChange();
  }
  function finishClose(){
    stopCatSpeech();
    active=false;progress=0;focus=null;last=0;if(roomPatch)roomPatch.hidden=true;dialog.close();delete room.dataset.section;
    button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});onChange();
  }
  function tick(now){
    frame=0;if(!active||document.hidden)return;
    const dt=last?Math.min((now-last)/1000,.25):0;last=now;
    progress=advancePage(progress,direction,dt*1.3,isStill());
    render();
    if(direction<0&&progress<=((isLaptop||isCat||isBook)?pageTiming.arrival:0)){finishClose();return;}
    if(direction>0&&progress===1){
      panel.scrollTop=0;last=0;
      if(isCat)startCatSpeech();
      return;
    }
    frame=requestAnimationFrame(tick);
  }
  function schedule(){if(active&&!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function open(){
    if(active)return;active=true;direction=1;progress=isStill()?1:isLaptop||isBook?pageTiming.arrival:0;last=0;
    button.setAttribute('aria-expanded','true');panel.scrollTop=0;
    dialog.showModal();onCue(id);render();closeButton.focus({preventScroll:true});
    if(progress===1){
      panel.scrollTop=0;
      if(isCat)startCatSpeech();
    }
    schedule();
  }
  function close(){
    if(!active||direction<0)return;
    stopCatSpeech();
    direction=-1;last=0;schedule();
  }
  button.addEventListener('click',open);
  closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  addEventListener('resize',()=>{if(active)render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;if(active)finishClose();});
  return {get active(){return active;},getFocus(){return focus;},
    getFootGesture(){return active&&direction>0?Math.sin(clamp((progress-pageTiming.footStart)/(pageTiming.footEnd-pageTiming.footStart),0,1)*Math.PI):0;}};
}
