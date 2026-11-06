import { projectPageRect, pageDestination, advancePage, pageTiming, footTipOnScreen, magicPoint } from './page-motion.js';
import { createPageMagic } from './page-magic.js';
import { soundFX } from './sound-fx.js';

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
  leaf:{title:'Room to grow',eyebrow:'THE PLANT · GROWTH',lead:'Ideas take root when given space to branch out.',
    body:'Like everything in this room, good projects start small. A little patience, regular attention, and the freedom to explore off the beaten path are what turn curious experiments into living creations.',
    detail:'Click anywhere or close to return the leaf to the plant.',label:'The plant',bounds:[2130,560,100,55]},
  phone:{title:'Let’s build together',eyebrow:'THE PHONE · CONTACT',lead:'Direct line for engineering & ideas.',
    body:'Always curious about new projects, creative tools, AI experiments, and collaborative software.',
    detail:'Reach out via email or connect on GitHub and LinkedIn.',label:'Contact',bounds:[1800,828,70,80]},
};

export function createObjectSection({id,room,button,scene,image,getView,getFootMotion,isStill,onChange,onCue}){
  const content=objectSectionContent[id];
  const isLaptop=id==='laptop';
  const isCat=id==='cat';
  const isBook=id==='book';
  const isLeaf=id==='leaf';
  const isPhone=id==='phone';
  const patchArt={laptop:{file:'laptop-sofa-patch.png',bounds:[1320,560,480,430]},cat:{file:'cat-sofa-patch.png',bounds:[940,680,470,390]},book:{file:'book-floor-patch.png',bounds:[1150,1210,650,326]},leaf:{file:'leaf-plant-patch.png',bounds:[2125,555,110,64]},phone:{file:'phone-sofa-patch.png',bounds:[1785,815,100,105]}}[id];
  const roomPatch=patchArt?document.createElement('img'):null;
  if(roomPatch){roomPatch.src=`./art/${patchArt.file}`;roomPatch.alt='';roomPatch.className=`${id}-room-patch`;roomPatch.hidden=true;room.append(roomPatch);}
  const dialog=document.createElement('dialog');
  dialog.className=`object-dialog object-dialog--${id}`;dialog.id=`${id}-dialog`;
  dialog.setAttribute('aria-labelledby',`${id}-title`);
  const laptopPanelBody=`
      <button class="object-close" type="button" aria-label="Close laptop section" autofocus>×</button>
      <div class="laptop-toolbar" aria-hidden="true">
        <span class="laptop-led"></span>
        <span>HARSHIT SHARMA · /dev/workspace</span>
        <span class="laptop-status">ONLINE 🟢</span>
      </div>
      
      <div class="laptop-intro-block">
        <span class="laptop-eyebrow">ABOUT & PHILOSOPHY</span>
        <h2 class="laptop-headline">Entrepreneur trapped in the body of a software engineer.</h2>
        <p class="laptop-lead">I enjoy building reliable products from the backend to the frontend. I work across distributed systems, full-stack web applications, and AI-powered software, with a focus on writing clean code, solving real problems, and shipping things people actually use.</p>
        <div class="laptop-meta-bar">
          <span class="meta-tag">🎓 IIIT Sri City · B.Tech AI & Data Science (2023–2027) · CGPA 8.3</span>
          <a href="mailto:Harshitsharmaclg@gmail.com" class="meta-link">✉️ Email</a>
          <a href="https://github.com/HarshitSharma14" target="_blank" rel="noopener" class="meta-link">🐙 GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="meta-link">💼 LinkedIn</a>
          <a href="https://leetcode.com" target="_blank" rel="noopener" class="meta-link">⚡ LeetCode 1695</a>
          <a href="https://codeforces.com" target="_blank" rel="noopener" class="meta-link">🏆 Codeforces 1218</a>
        </div>
      </div>

      <div class="laptop-section">
        <h3 class="laptop-section-heading"><span>💼</span> Experience & Internships</h3>
        <div class="laptop-card-stack">
          
          <div class="laptop-card">
            <div class="card-top">
              <div>
                <h4 class="card-role">Software Engineer <span class="card-org">@ EmendoAI</span></h4>
                <span class="card-time">Oct 2026 – Present · Remote</span>
              </div>
            </div>
            <ul class="card-points">
              <li>Fully owned backend and GenAI development for Paints Closeout, from design to deployment, combining batch image processing, asynchronous color lookup, and surface matching to generate project handover reports.</li>
              <li>Driving end-to-end development of EmendoAI’s web platform, translating mobile-app workflows into a desktop web experience spanning UX/UI design, frontend architecture and backend integration.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top">
              <div>
                <h4 class="card-role">Software Engineer Intern <span class="card-org">@ EmendoAI</span></h4>
                <span class="card-time">Mar 2026 – Sep 2026 (7 mos) · Remote</span>
              </div>
            </div>
            <ul class="card-points">
              <li>Developed and owned <strong>AI Actions</strong>, enabling users to create and manage application entities through natural-language conversations.</li>
              <li>Developed <strong>AMA Bot V3</strong> and owned its ongoing development, rearchitecture, and feature extensions, spanning context management, intent classification, NL2SQL, and multi-tool orchestration.</li>
              <li>Architected and implemented an automated resource-deletion lifecycle, combining soft deletion, scheduled permanent deletion, and background cleanup of dependent resources.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top">
              <div>
                <h4 class="card-role">Full Stack Developer Intern <span class="card-org">@ SiteGuru</span></h4>
                <span class="card-time">Aug 2025 – Sep 2025 (2 mos) · Remote</span>
              </div>
            </div>
            <ul class="card-points">
              <li>Developed a multi-tenant CRM with configurable roles, hierarchies, workflows, and permissions; designed SQL schemas for tenant isolation across <strong>65+ interlinked tables</strong>.</li>
              <li>Built role-based dashboards and audit logs for employee and administrator traceability, along with server-rendered, customizable CRM pages.</li>
            </ul>
          </div>

        </div>
      </div>

      <div class="laptop-section">
        <h3 class="laptop-section-heading"><span>🚀</span> Featured Projects</h3>
        <div class="laptop-card-stack">
          
          <div class="laptop-card">
            <div class="card-top">
              <div>
                <h4 class="card-role">Distributed Job Queue</h4>
                <div class="card-badges">
                  <span>Python</span><span>FastAPI</span><span>PostgreSQL</span><span>Redis</span><span>Docker</span><span>Oracle Cloud</span>
                </div>
              </div>
            </div>
            <ul class="card-points">
              <li>Architected and deployed separate API, worker, scheduler, and recovery services on an Oracle Cloud VM; built Admin, Producer, and Worker workflows to publish jobs and monitor queue health.</li>
              <li>Used PostgreSQL as the source of truth and Redis for delivery; implemented a <strong>transactional outbox</strong> to guarantee zero job loss on publication failure.</li>
              <li>Added idempotency, attempt fencing, leases, heartbeats, retries, and dead-letter queues for at-least-once execution under worker crashes and duplicate delivery.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top">
              <div>
                <h4 class="card-role">Legalos — Multi-Agent Legal RAG</h4>
                <div class="card-badges">
                  <span>LangGraph</span><span>Qdrant</span><span>Ollama</span><span>LangChain</span><span>Pydantic</span>
                </div>
              </div>
            </div>
            <ul class="card-points">
              <li>Built a legal-document RAG system using LangGraph, Qdrant, and local language models, combining query rewriting, multi-query retrieval, and structured cited answers.</li>
              <li>Developed automated retrieval and generation evaluations, improving an internal benchmark from <strong>33.93% to 43.37%</strong> through retrieval changes.</li>
              <li>Engineered a multi-agent RAG architecture that breaks down multi-issue questions, classifies each along intent axes, and coordinates specialist agents for legal-section lookup and applicability checks.</li>
            </ul>
          </div>

        </div>
      </div>

      <div class="laptop-section">
        <h3 class="laptop-section-heading"><span>⚡</span> Technical Skills</h3>
        <div class="laptop-skills-grid">
          <div class="skill-box">
            <span class="skill-head">Languages</span>
            <p class="skill-list">Python, JavaScript, TypeScript, Java, C++, C, SQL</p>
          </div>
          <div class="skill-box">
            <span class="skill-head">Backend & Systems</span>
            <p class="skill-list">FastAPI, Node.js, PostgreSQL, Redis, REST APIs, MongoDB, Distributed Systems, System Design</p>
          </div>
          <div class="skill-box">
            <span class="skill-head">Frontend</span>
            <p class="skill-list">React, Next.js, Vue, HTML5, CSS3, Figma</p>
          </div>
          <div class="skill-box">
            <span class="skill-head">AI Systems</span>
            <p class="skill-list">LangGraph, LangChain, RAG, Qdrant, Google ADK, LLM APIs, Prompt Engineering</p>
          </div>
          <div class="skill-box">
            <span class="skill-head">Cloud & Tools</span>
            <p class="skill-list">Docker, Linux, Git, CI/CD, AWS (EC2, S3, Lambda), Oracle Cloud</p>
          </div>
        </div>
      </div>

      <div class="object-rule"></div>
      <span class="object-footer">A ROOM OF MY OWN · HARSHIT SHARMA</span>`;
  const panelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      <span class="object-eyebrow"></span><h2 id="${id}-title"></h2>
      <p class="object-lead"></p><p class="object-body"></p><div class="object-rule"></div><p class="object-detail"></p>
      <span class="object-footer">A ROOM OF MY OWN</span>`;
  const catPanelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      <div class="wispr-minimal-flow">
        <div class="wispr-icon-wrap" aria-hidden="true">
          <img src="./art/wispr-flow-icon-light.png" alt="" />
          <span class="wispr-pulse-ring"></span>
        </div>
        <div class="wispr-word-flow" id="cat-speech-output" aria-live="polite"></div>
      </div>`;
  const phonePanelBody=`
      <button class="object-close" type="button" aria-label="Close ${content.label} section" autofocus>×</button>
      <div class="phone-header" aria-hidden="true">
        <span class="phone-time">9:41</span>
        <div class="phone-island"></div>
        <span class="phone-signal">5G ⚡</span>
      </div>
      <span class="object-eyebrow">${content.eyebrow}</span>
      <h2 id="${id}-title">${content.title}</h2>
      <p class="object-lead">${content.lead}</p>
      <div class="phone-links">
        <a href="mailto:harshitsharmaclg@gmail.com" class="phone-link-btn phone-link-primary">
          <span class="phone-link-icon">✉️</span>
          <span>harshitsharmaclg@gmail.com</span>
        </a>
        <a href="https://github.com/HarshitSharma14" target="_blank" rel="noopener" class="phone-link-btn">
          <span class="phone-link-icon">🐙</span>
          <span>github.com/HarshitSharma14</span>
        </a>
        <a href="https://a-room-of-my-own.vercel.app" target="_blank" rel="noopener" class="phone-link-btn">
          <span class="phone-link-icon">✨</span>
          <span>a-room-of-my-own.vercel.app</span>
        </a>
      </div>
      <div class="object-rule"></div>
      <p class="object-detail">${content.detail}</p>
      <span class="object-footer">A ROOM OF MY OWN</span>`;
  const panelHTML=`<article class="object-panel" tabindex="0" aria-label="${content.label} section">${isLaptop?`<div class="laptop-screen-content">${laptopPanelBody}</div>`:isCat?catPanelBody:isPhone?phonePanelBody:panelBody}</article>`;
  dialog.innerHTML=`<button class="object-backdrop" type="button" tabindex="-1" aria-label="Close ${content.label} section"></button>
    ${isLaptop?`<div class="object-traveler object-laptop"><div class="laptop-machine"><img class="laptop-front" src="./art/laptop-front.png" alt="" draggable="false">${panelHTML}</div></div>`
      :isPhone?`<div class="object-traveler object-phone"><div class="phone-machine"><div class="phone-front">${panelHTML}</div><div class="phone-back"><img class="phone-back-img" src="./art/phone-back.png" alt="" draggable="false"></div></div></div>`
      :isCat?`<div class="object-traveler object-cat" aria-hidden="true"><img class="cat-front cat-front--closed" src="./art/cat-front.png" alt="" draggable="false"><img class="cat-front cat-front--talking" src="./art/cat-front-talking.png" alt="" draggable="false" style="display:none;"></div>${panelHTML}`
      :isBook?`<div class="object-traveler object-book" aria-hidden="true"><img class="book-open" src="./art/book-open.png" alt="" draggable="false"><div class="book-cover"><img class="book-front" src="./art/book-front.png" alt="" draggable="false"></div></div>${panelHTML}`
      :isLeaf?`<div class="object-traveler object-leaf" aria-hidden="true"><img class="leaf-front" src="./art/leaf-front.png" alt="" draggable="false"></div>${panelHTML}`
      :`<div class="object-traveler" aria-hidden="true"><div class="object-portrait"></div></div>${panelHTML}`}`;
  if(!isCat&&!isPhone&&!isLaptop){
    for(const [selector,value] of [['.object-eyebrow',content.eyebrow],['h2',content.title],['.object-lead',content.lead],['.object-body',content.body],['.object-detail',content.detail]]) dialog.querySelector(selector).textContent=value;
  }
  document.body.append(dialog);
  const traveler=dialog.querySelector('.object-traveler'), portrait=dialog.querySelector('.object-portrait');
  const machine=dialog.querySelector('.laptop-machine');
  const phoneMachine=dialog.querySelector('.phone-machine');
  const screenContent=dialog.querySelector('.laptop-screen-content');
  const bookOpen=dialog.querySelector('.book-open'),bookCover=dialog.querySelector('.book-cover');
  const panel=dialog.querySelector('.object-panel'), backdrop=dialog.querySelector('.object-backdrop');
  const magic=null;
  if(portrait)portrait.style.backgroundImage=`url("${image.currentSrc||image.src}")`;
  const closeButton=dialog.querySelector('.object-close');
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);button.setAttribute('aria-expanded','false');
  button.dataset.label=id==='cat'?'The cat':id==='laptop'?'Projects':id==='book'?'The book':id==='leaf'?'The plant':id==='phone'?'Contact': 'Beyond code';
  let active=false,progress=0,direction=1,frame=0,last=0,focus=null;
  let catSpeechTimer=null,catMouthTimer=null,catAutoReturnTimer=null,catSpeaking=false;
  const catClosedImg=isCat?dialog.querySelector('.cat-front--closed'):null;
  const catTalkingImg=isCat?dialog.querySelector('.cat-front--talking'):null;
  const catSpeechOutput=isCat?dialog.querySelector('#cat-speech-output'):null;
  const catWisprWrap=isCat?dialog.querySelector('.wispr-icon-wrap'):null;

  function stopCatSpeech(){
    soundFX.stopCatMeow();
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
    soundFX.playCatMeow();
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
        if(wordIndex%4===1) soundFX.playCatChirp();
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
    if(isPhone){
      const aspect=360/680;
      const phase=clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1);
      const fly=ease(clamp(phase,0,1));
      const startWidth=source.width;
      const isMobile=rect.width<=600;
      const targetWidth=isMobile?Math.min(rect.width*.85,320):Math.min(rect.width*.32,360);
      width=startWidth+(targetWidth-startWidth)*fly;
      height=width/aspect;
      cx=source.left+source.width/2+(rect.left+rect.width/2-source.left-source.width/2)*fly;
      cy=source.top+source.height/2+(rect.top+rect.height/2-source.top-source.height/2)*fly;
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
    if(isLeaf){
      const aspect=1200/680;
      const phase=clamp((progress-pageTiming.arrival)/(1-pageTiming.arrival),0,1);
      const fly=ease(phase);
      const startWidth=source.width;
      const isMobile=rect.width<=700;
      const targetWidth=isMobile?Math.min(rect.width*0.96,520):Math.min(rect.width*0.75,880);
      width=startWidth+(targetWidth-startWidth)*fly;
      height=width/aspect;
      cx=source.left+source.width/2+(rect.left+rect.width/2-source.left-source.width/2)*fly;
      cy=source.top+source.height/2+(rect.top+rect.height/2-source.top-source.height/2)*fly;
    }
    Object.assign(traveler.style,{left:`${cx-width/2}px`,top:`${cy-height/2}px`,width:`${width}px`,height:`${height}px`,
      opacity:String(progress>=pageTiming.arrival?1:0),
      transform:isBook?`perspective(1000px) rotateX(${55*(1-bookFlight)}deg) rotateZ(${-16*(1-bookFlight)}deg)`:isLeaf?`perspective(1000px) rotateZ(${-30*(1-t)+20*Math.sin(t*Math.PI)}deg) rotateY(${70*(1-t)}deg) rotateX(${15*Math.sin(t*Math.PI)}deg)`:isLaptop||isCat||isPhone?'none':`rotate(${8*Math.sin(t*Math.PI)}deg)`,
      pointerEvents:(isLaptop||isPhone)&&progress>.85?'auto':'none'});
    if(machine){
      const turn=ease(clamp((progress-pageTiming.arrival)/(.9-pageTiming.arrival),0,1));
      machine.style.transform=`rotateY(${54*(1-turn)}deg) rotateX(${-9*(1-turn)}deg) rotateZ(${-8*(1-turn)}deg)`;
      screenContent.style.opacity=String(ease(clamp((progress-.61)/.3,0,1)));
    }else if(phoneMachine){
      const turn=ease(clamp((progress-pageTiming.arrival)/(.9-pageTiming.arrival),0,1));
      phoneMachine.style.transform=`rotateY(${180*(1-turn)}deg)`;
    }else if(portrait){
      const imageWidth=rect.width/crop.width,imageHeight=rect.height/crop.height;
      portrait.style.backgroundSize=`${imageWidth}px ${imageHeight}px`;
      portrait.style.backgroundPosition=`${-(source.left-rect.left+crop.x*imageWidth)}px ${-(source.top-rect.top+crop.y*imageHeight)}px`;
      portrait.style.width=`${source.width}px`;portrait.style.height=`${source.height}px`;
      portrait.style.transform=`scale(${width/source.width},${height/source.height})`;
    }
    panel.style.opacity=isLaptop||isPhone?'1':String(ease(clamp((progress-(isCat||isBook||isLeaf?.8:.66))/(isCat||isBook||isLeaf?.2:.34),0,1)));
    if(!isLaptop&&!isPhone)panel.style.transform=isBook?'translateY(-50%)':isCat?'translateY(-50%)':isLeaf?'translate(-50%,-50%)':`translateY(${(1-t)*28}px) scale(${.94+.06*t})`;
    panel.style.pointerEvents=progress>.85?'auto':'none';
    backdrop.style.opacity=String(progress*.75);
    const center=[source.left+source.width/2,source.top+source.height/2];
    focus=[cx,cy];
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
    if(direction<0&&progress<=pageTiming.arrival){finishClose();return;}
    if(direction>0&&progress===1){
      panel.scrollTop=0;last=0;
      if(isCat)startCatSpeech();
      return;
    }
    frame=requestAnimationFrame(tick);
  }
  function schedule(){if(active&&!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function open(){
    if(active)return;active=true;direction=1;progress=isStill()?1:pageTiming.arrival;last=0;
    if(isCat)soundFX.playCatMeow();
    else if(isLaptop)soundFX.playLaptopOpen();
    else if(isBook)soundFX.playBookOpen();
    else if(isLeaf)soundFX.playLeafPluck();
    else soundFX.playClick();
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
    soundFX.playClose();
    stopCatSpeech();
    direction=-1;last=0;schedule();
  }
  button.addEventListener('click',open);
  closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  addEventListener('resize',()=>{if(active)render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;if(active)finishClose();});
  return {get active(){return active;},getFocus(){return focus;},getFootGesture(){return 0;}};
}
