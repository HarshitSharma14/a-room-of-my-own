import { projectPageRect, pageDestination, advancePage, pagePose, pageTiming, footTipOnScreen, magicPoint } from './page-motion.js';
import { storyContent } from './story-content.js';

export function createStoryPage({room,button,scene,getView,getFootMotion,isStill,onChange}) {
  const patch=document.createElement('img');
  patch.src='./art/story-wall.png';patch.alt='';patch.className='story-wall-patch';patch.hidden=true;
  room.append(patch);
  const dialog=document.createElement('dialog');
  dialog.className='story-dialog';dialog.id='story-dialog';
  dialog.setAttribute('aria-labelledby','story-title');
  dialog.innerHTML=`
    <button class="story-backdrop" type="button" tabindex="-1" aria-label="Return the page to the wall"></button>
    <div class="story-sheet">
      <img class="story-sprite" src="./art/story-page.png" alt="" draggable="false">
      <div class="story-paper">
        <button class="story-close" type="button" aria-label="Close my story and return the page" autofocus><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
        <article class="story-copy" tabindex="0" aria-label="My story">
          <div class="story-masthead"><span data-copy="eyebrow"></span><span>01 / 06</span></div>
          <h2 id="story-title" data-copy="title"></h2>
          <p class="story-lead" data-copy="lead"></p>
          <div class="story-rule" aria-hidden="true"></div>
          <p class="story-introduction" data-copy="introduction"></p>
          <div class="story-chapters"></div>
          <p class="story-closing" data-copy="closing"></p>
          <footer><span class="story-signature" data-copy="signature"></span><span>A ROOM OF MY OWN</span></footer>
        </article>
        <span class="story-fold" aria-hidden="true"></span>
      </div>
    </div>
    <img class="story-nail" src="./art/story-nail.png" alt="" draggable="false">`;
  for(const node of dialog.querySelectorAll('[data-copy]')) node.textContent=storyContent[node.dataset.copy];
  for(const chapter of storyContent.sections) {
    const section=document.createElement('section'), number=document.createElement('span');
    const heading=document.createElement('h3'), paragraph=document.createElement('p');
    number.className='story-chapter-number';number.textContent=chapter.number;
    heading.textContent=chapter.title;paragraph.textContent=chapter.text;
    section.append(number,heading,paragraph);dialog.querySelector('.story-chapters').append(section);
  }
  document.body.append(dialog);
  const sheet=dialog.querySelector('.story-sheet'), sprite=dialog.querySelector('.story-sprite');
  const paper=dialog.querySelector('.story-paper'), copy=dialog.querySelector('.story-copy');
  const nail=dialog.querySelector('.story-nail'), backdrop=dialog.querySelector('.story-backdrop');
  const closeButton=dialog.querySelector('.story-close');
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);
  button.setAttribute('aria-expanded','false');
  let active=false, pending=false, progress=0, direction=1, frame=0, last=0, currentPose=null, focus=null;
  let assetsReady=true;
  const ready=Promise.all([patch,sprite,nail].map(img=>img.decode())).catch(()=>{assetsReady=false;});

  function place(element,bounds) {
    Object.assign(element.style,{left:`${bounds.left}px`,top:`${bounds.top}px`,width:`${bounds.width}px`,height:`${bounds.height}px`});
  }
  function render() {
    const {rect,crop}=getView();
    const source=projectPageRect(scene.page.paper,scene,rect,crop), destination=pageDestination(rect);
    currentPose=pagePose(progress,source,destination);
    const pose=currentPose;
    place(patch,projectPageRect(scene.page.patch,scene,rect,crop));
    place(sheet,destination);
    sheet.style.transform=`translate(${pose.cx-destination.left-destination.width/2}px,${pose.cy-destination.top-destination.height/2}px) rotate(${pose.angle}deg) scale(${pose.sx},${pose.sy})`;
    sheet.style.filter=`drop-shadow(0 ${pose.flight*18}px ${pose.flight*26}px rgb(10 14 22 / ${pose.flight*.38}))`;
    sprite.style.opacity=String(1-pose.surface);paper.style.opacity=String(pose.surface);
    copy.style.opacity=String(pose.copy);copy.style.transform=`translateY(${(1-pose.copy)*10}px)`;
    backdrop.style.opacity=String(pose.dim);
    const pin=projectPageRect(scene.page.nail,scene,rect,crop);place(nail,pin);
    const toe=footTipOnScreen(getFootMotion(),scene,rect,crop), nailCenter=[pin.left+pin.width/2,pin.top+pin.height/2];
    focus=direction>0&&progress<pageTiming.arrival?magicPoint(progress,toe,nailCenter):[pose.cx,pose.cy];
    nail.style.transform=`translate(${pose.nail.x}px,${pose.nail.y}px) rotate(${pose.nail.angle}deg)`;
    nail.style.opacity=String(pose.nail.opacity);
    dialog.dataset.state=direction<0?'returning':pose.state;
    room.dataset.section='story';
    onChange();
  }
  function finishClose() {
    active=false;progress=0;currentPose=null;focus=null;last=0;
    patch.hidden=true;dialog.close();delete room.dataset.section;
    button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});onChange();
  }
  function tick(now) {
    frame=0;if(document.hidden||!active)return;
    const dt=last?Math.min((now-last)/1000,.08):0;last=now;
    progress=advancePage(progress,direction,dt,isStill()||!assetsReady);
    render();
    // Returning the paper ends at the wall, without replaying the magic prelude.
    if(direction<0&&progress<=pageTiming.arrival){finishClose();return;}
    if(direction>0&&progress===1){last=0;return;}
    frame=requestAnimationFrame(tick);
  }
  function schedule() {if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(tick);}
  async function open() {
    if(active||pending)return;pending=true;await ready;pending=false;
    active=true;direction=1;progress=isStill()||!assetsReady?1:0;last=0;
    patch.hidden=!assetsReady;copy.scrollTop=0;
    button.setAttribute('aria-expanded','true');
    dialog.showModal();render();closeButton.focus({preventScroll:true});schedule();
  }
  function close() {
    if(!active||direction<0)return;direction=-1;last=0;schedule();
  }
  button.addEventListener('click',open);
  closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  addEventListener('resize',()=>{if(active)render();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();
  });
  addEventListener('pagehide',()=>{pending=false;cancelAnimationFrame(frame);frame=0;if(active)finishClose();});
  return {
    get active(){return active;},
    getFocus(){return focus;},
    getFootGesture(){return active&&direction>0&&currentPose?currentPose.footGesture:0;},
  };
}
