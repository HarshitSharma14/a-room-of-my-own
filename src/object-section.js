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
      <div class="laptop-toolbar">
        <div class="laptop-window-controls" aria-hidden="true">
          <span class="win-dot win-dot--red"></span>
          <span class="win-dot win-dot--yellow"></span>
          <span class="win-dot win-dot--green"></span>
        </div>
        <div class="laptop-wispr-badge">
          <img src="./art/wispr-flow-icon-light.png" alt="Wispr Flow" class="laptop-wispr-icon" />
          <span>Wispr Flow</span>
        </div>
        <span class="laptop-title-tab">harshit@portfolio: ~/workspace</span>
        <div class="laptop-nav-pills" role="tablist">
          <a href="#laptop-overview" class="laptop-nav-pill">Overview</a>
          <a href="#laptop-experience" class="laptop-nav-pill">Experience</a>
          <a href="#laptop-projects" class="laptop-nav-pill">Projects</a>
          <a href="#laptop-skills" class="laptop-nav-pill">Skills</a>
        </div>
      </div>
      
      <div id="laptop-overview" class="laptop-intro-block">
        <div class="laptop-badge-row">
          <span class="badge-role">SOFTWARE ENGINEER</span>
          <span class="badge-wispr">
            <img src="./art/wispr-flow-icon-light.png" alt="Wispr Flow" class="badge-wispr-icon" />
            <span>WISPR FLOW '26</span>
          </span>
          <span class="badge-avail"><span class="pulse-dot"></span> OPEN TO BUILD</span>
        </div>
        <h2 class="laptop-headline">Entrepreneur trapped in the body of a software engineer.</h2>
        <p class="laptop-lead">I enjoy building reliable products from the backend to the frontend. I work across distributed systems, full-stack web applications, and AI-powered software, with a focus on writing clean code, solving real problems, and shipping things people actually use.</p>
        
        <div class="laptop-meta-card">
          <div class="meta-edu-row">
            <span class="edu-icon">🎓</span>
            <div>
              <h4 class="edu-school">Indian Institute of Information Technology Sri City</h4>
              <p class="edu-degree">B.Tech in Artificial Intelligence & Data Science <span class="edu-time">(Aug 2023 – Jun 2027)</span> · <strong>CGPA: 8.3</strong></p>
            </div>
          </div>
          <div class="meta-links-grid">
            <a href="mailto:Harshitsharmaclg@gmail.com" class="meta-link-btn">
              <span class="link-icon">✉️</span> Harshitsharmaclg@gmail.com
            </a>
            <a href="https://github.com/HarshitSharma14" target="_blank" rel="noopener" class="meta-link-btn">
              <span class="link-icon">🐙</span> GitHub
            </a>
            <a href="https://www.linkedin.com/in/harshitsharma1331/" target="_blank" rel="noopener" class="meta-link-btn">
              <span class="link-icon">💼</span> LinkedIn
            </a>
            <a href="https://leetcode.com/u/Harshit1405/" target="_blank" rel="noopener" class="meta-link-btn">
              <span class="link-icon">⚡</span> LeetCode (Peak: 1695)
            </a>
            <a href="https://codeforces.com/profile/harshitsharma14" target="_blank" rel="noopener" class="meta-link-btn">
              <span class="link-icon">🏆</span> Codeforces (Peak: 1218)
            </a>
            <span class="meta-link-btn meta-link-btn--static">
              <span class="link-icon">🎯</span> JEE Advanced (Top 9%)
            </span>
          </div>
        </div>
      </div>

      <div id="laptop-experience" class="laptop-section">
        <div class="section-header-row">
          <h3 class="laptop-section-heading"><span>💼</span> Work Experience & Internships</h3>
          <span class="section-counter">3 ROLES</span>
        </div>
        
        <div class="laptop-card-stack">
          
          <div class="laptop-card">
            <div class="card-top-row">
              <div class="card-title-group">
                <h4 class="card-role">Software Engineer</h4>
                <span class="card-company">EmendoAI</span>
              </div>
              <div class="card-timing-badge">Oct 2026 – Present · Remote</div>
            </div>
            <ul class="card-points">
              <li>Fully owned backend and GenAI development for <strong>Paints Closeout</strong>, from design to deployment, combining batch image processing, asynchronous color lookup, and surface matching to generate project handover reports.</li>
              <li>Driving end-to-end development of <strong>EmendoAI’s web platform</strong>, translating mobile-app workflows into a desktop web experience spanning UX/UI design, frontend architecture, and backend integration.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top-row">
              <div class="card-title-group">
                <h4 class="card-role">Software Engineer Intern</h4>
                <span class="card-company">EmendoAI</span>
              </div>
              <div class="card-timing-badge">Mar 2026 – Sep 2026 · 7 mos · Remote</div>
            </div>
            <ul class="card-points">
              <li>Developed and owned <strong>AI Actions</strong>, enabling users to create and manage application entities through natural-language conversations.</li>
              <li>Developed <strong>AMA Bot V3</strong> and own its ongoing development, rearchitecture, and feature extensions, spanning context management, intent classification, <strong>NL2SQL</strong>, and multi-tool orchestration.</li>
              <li>Architected and implemented an automated <strong>resource-deletion lifecycle</strong>, combining soft deletion, scheduled permanent deletion, and background cleanup of dependent resources.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top-row">
              <div class="card-title-group">
                <h4 class="card-role">Full Stack Developer Intern</h4>
                <span class="card-company">SiteGuru</span>
              </div>
              <div class="card-timing-badge">Aug 2025 – Sep 2025 · 2 mos · Remote</div>
            </div>
            <ul class="card-points">
              <li>Developed a <strong>multi-tenant CRM</strong> with configurable roles, hierarchies, workflows, and permissions; designed SQL schemas for tenant isolation across <strong>65+ interlinked tables</strong>.</li>
              <li>Built role-based dashboards and audit logs for employee and administrator traceability, along with server-rendered, customizable CRM pages.</li>
            </ul>
          </div>

        </div>
      </div>

      <div id="laptop-projects" class="laptop-section">
        <div class="section-header-row">
          <h3 class="laptop-section-heading"><span>🚀</span> Featured Projects</h3>
          <span class="section-counter">SYSTEMS & AI</span>
        </div>

        <div class="laptop-card-stack">
          
          <div class="laptop-card">
            <div class="card-top-row">
              <div class="card-title-group">
                <h4 class="card-role">Distributed Job Queue</h4>
                <span class="card-subtitle">Fault-Tolerant Asynchronous Execution Engine</span>
              </div>
              <div class="card-actions-row">
                <a href="https://github.com/HarshitSharma14/Distributed-job-queue" target="_blank" rel="noopener" class="project-action-btn">
                  <span class="action-icon">🐙</span> Repository
                </a>
                <a href="https://relay.140-238-241-160.sslip.io/app/login" target="_blank" rel="noopener" class="project-action-btn project-action-btn--live">
                  <span class="action-icon">🔗</span> Live Application
                </a>
              </div>
            </div>
            <div class="card-pill-row">
              <span class="tech-pill tech-pill--cyan">Python</span>
              <span class="tech-pill tech-pill--cyan">FastAPI</span>
              <span class="tech-pill tech-pill--blue">PostgreSQL</span>
              <span class="tech-pill tech-pill--red">Redis</span>
              <span class="tech-pill tech-pill--slate">Docker</span>
              <span class="tech-pill tech-pill--amber">Oracle Cloud</span>
            </div>
            <ul class="card-points">
              <li>Architected and deployed separate <strong>API, worker, scheduler, and recovery services</strong> on an Oracle Cloud VM; built Admin, Producer, and Worker workflows to publish jobs and monitor queue health.</li>
              <li>Used PostgreSQL as the source of truth and Redis for delivery; implemented a <strong>transactional outbox</strong> to guarantee zero job loss when publication fails.</li>
              <li>Engineered <strong>idempotency, attempt fencing, leases, heartbeats, retries</strong>, and dead-letter queues for at-least-once execution under worker crashes and duplicate delivery.</li>
            </ul>
          </div>

          <div class="laptop-card">
            <div class="card-top-row">
              <div class="card-title-group">
                <h4 class="card-role">Legalos — Multi-Agent Legal RAG</h4>
                <span class="card-subtitle">Autonomous Legal Question Decomposition & Statutory Retrieval</span>
              </div>
              <div class="card-actions-row">
                <a href="https://github.com/prasenjitb-cloud/legalos" target="_blank" rel="noopener" class="project-action-btn">
                  <span class="action-icon">🐙</span> Repository
                </a>
              </div>
            </div>
            <div class="card-pill-row">
              <span class="tech-pill tech-pill--purple">LangGraph</span>
              <span class="tech-pill tech-pill--purple">LangChain</span>
              <span class="tech-pill tech-pill--emerald">Qdrant</span>
              <span class="tech-pill tech-pill--slate">Ollama</span>
              <span class="tech-pill tech-pill--cyan">Pydantic</span>
            </div>
            <ul class="card-points">
              <li>Built a legal-document RAG system using LangGraph, Qdrant, and local language models, combining <strong>query rewriting, multi-query retrieval</strong>, and structured cited answers.</li>
              <li>Developed automated retrieval and generation evaluations, improving an internal benchmark from <strong>33.93% to 43.37%</strong> through retrieval pipeline optimizations.</li>
              <li>Architected a <strong>multi-agent RAG workflow</strong> that breaks down multi-issue questions, classifies each along intent axes, and coordinates specialist agents for statutory lookup and cited answers.</li>
            </ul>
          </div>

        </div>
      </div>

      <div id="laptop-skills" class="laptop-section">
        <div class="section-header-row">
          <h3 class="laptop-section-heading"><span>⚡</span> Technical Skills</h3>
          <span class="section-counter">CORE STACK</span>
        </div>

        <div class="laptop-skills-grid">
          
          <div class="skill-category-card">
            <span class="category-title">Languages</span>
            <div class="skill-tags">
              <span class="tech-pill">Python</span>
              <span class="tech-pill">JavaScript</span>
              <span class="tech-pill">TypeScript</span>
              <span class="tech-pill">Java</span>
              <span class="tech-pill">C++</span>
              <span class="tech-pill">C</span>
              <span class="tech-pill">SQL</span>
            </div>
          </div>

          <div class="skill-category-card">
            <span class="category-title">Backend & Distributed Systems</span>
            <div class="skill-tags">
              <span class="tech-pill">FastAPI</span>
              <span class="tech-pill">Node.js</span>
              <span class="tech-pill">PostgreSQL</span>
              <span class="tech-pill">Redis</span>
              <span class="tech-pill">REST APIs</span>
              <span class="tech-pill">MongoDB</span>
              <span class="tech-pill">Distributed Systems</span>
              <span class="tech-pill">System Design</span>
            </div>
          </div>

          <div class="skill-category-card">
            <span class="category-title">AI & Agentic Systems</span>
            <div class="skill-tags">
              <span class="tech-pill">LangGraph</span>
              <span class="tech-pill">LangChain</span>
              <span class="tech-pill">RAG</span>
              <span class="tech-pill">Qdrant</span>
              <span class="tech-pill">Google ADK</span>
              <span class="tech-pill">LLM APIs</span>
              <span class="tech-pill">NL2SQL</span>
              <span class="tech-pill">Prompt Engineering</span>
            </div>
          </div>

          <div class="skill-category-card">
            <span class="category-title">Frontend & Interfaces</span>
            <div class="skill-tags">
              <span class="tech-pill">React</span>
              <span class="tech-pill">Next.js</span>
              <span class="tech-pill">Vue</span>
              <span class="tech-pill">HTML5</span>
              <span class="tech-pill">CSS3 / WebGL</span>
              <span class="tech-pill">Figma</span>
            </div>
          </div>

          <div class="skill-category-card">
            <span class="category-title">Cloud, DevOps & Tools</span>
            <div class="skill-tags">
              <span class="tech-pill">Docker</span>
              <span class="tech-pill">Linux</span>
              <span class="tech-pill">Git</span>
              <span class="tech-pill">CI/CD</span>
              <span class="tech-pill">AWS (EC2, S3, Lambda)</span>
              <span class="tech-pill">Oracle Cloud</span>
            </div>
          </div>

        </div>
      </div>

      <div class="object-rule"></div>
      <span class="object-footer">HARSHIT SHARMA · A ROOM OF MY OWN</span>`;
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
  const bookPanelBody=`
      <button class="object-close" type="button" aria-label="Close book section" autofocus>×</button>
      <div class="book-journal-spread">
        
        <section class="book-page book-page--left">
          <h2 class="book-heading">Hobbies</h2>
          <ul class="book-simple-list">
            <li>Having conversations</li>
            <li>Gaming</li>
            <li>Chess</li>
            <li>Music</li>
            <li>Sleeping</li>
            <li>Doing POCs for random shit ideas I get</li>
            <li>Doomscrolling cat reels</li>
          </ul>
        </section>

        <section class="book-page book-page--right">
          <h2 class="book-heading">Bucket List</h2>
          <ul class="book-simple-list">
            <li>Scuba diving</li>
            <li>Skydiving</li>
            <li>Bungee jumping</li>
            <li>Having a pet cat</li>
            <li>Getting filthy rich</li>
            <li>Show others it's possible</li>
          </ul>
        </section>

      </div>`;
  const leafPanelBody=`
      <button class="object-close" type="button" aria-label="Close leaf section" autofocus>×</button>
      <div class="leaf-content-wrap">
        <span class="leaf-eyebrow">GET IN TOUCH</span>
        <h2 class="leaf-heading">Interested in building interesting stuff.</h2>
        <p class="leaf-subnote">If you're working on hard problems, ambitious ideas, or need an engineer who moves fast and ships—let's talk.</p>
        <div class="leaf-rule"></div>
        <div class="leaf-contacts">
          <a href="mailto:Harshitsharmaclg@gmail.com" class="leaf-contact-card">
            <span class="leaf-contact-icon">✉️</span>
            <div class="leaf-contact-text">
              <span class="leaf-contact-label">EMAIL</span>
              <strong class="leaf-contact-value">Harshitsharmaclg@gmail.com</strong>
            </div>
          </a>
          <a href="https://github.com/HarshitSharma14" target="_blank" rel="noopener" class="leaf-contact-card">
            <span class="leaf-contact-icon">🐙</span>
            <div class="leaf-contact-text">
              <span class="leaf-contact-label">GITHUB</span>
              <strong class="leaf-contact-value">github.com/HarshitSharma14</strong>
            </div>
          </a>
          <a href="https://www.linkedin.com/in/harshitsharma1331/" target="_blank" rel="noopener" class="leaf-contact-card">
            <span class="leaf-contact-icon">💼</span>
            <div class="leaf-contact-text">
              <span class="leaf-contact-label">LINKEDIN</span>
              <strong class="leaf-contact-value">linkedin.com/in/harshitsharma1331</strong>
            </div>
          </a>
        </div>
      </div>`;
  const panelHTML=`<article class="object-panel" tabindex="0" aria-label="${content.label} section">${isLaptop?`<div class="laptop-screen-content">${laptopPanelBody}</div>`:isCat?catPanelBody:isPhone?phonePanelBody:isBook?bookPanelBody:isLeaf?leafPanelBody:panelBody}</article>`;
  dialog.innerHTML=`<button class="object-backdrop" type="button" tabindex="-1" aria-label="Close ${content.label} section"></button>
    ${isLaptop?`<div class="object-traveler object-laptop"><div class="laptop-machine"><img class="laptop-front" src="./art/laptop-front.png" alt="" draggable="false">${panelHTML}</div></div>`
      :isPhone?`<div class="object-traveler object-phone"><div class="phone-machine"><div class="phone-front">${panelHTML}</div><div class="phone-back"><img class="phone-back-img" src="./art/phone-back.png" alt="" draggable="false"></div></div></div>`
      :isCat?`<div class="object-traveler object-cat" aria-hidden="true"><img class="cat-front cat-front--closed" src="./art/cat-front.png" alt="" draggable="false"><img class="cat-front cat-front--talking" src="./art/cat-front-talking.png" alt="" draggable="false" style="display:none;"></div>${panelHTML}`
      :isBook?`<div class="object-traveler object-book" aria-hidden="true"><img class="book-open" src="./art/book-open.png" alt="" draggable="false"><div class="book-cover"><img class="book-front" src="./art/book-front.png" alt="" draggable="false"></div></div>${panelHTML}`
      :isLeaf?`<div class="object-traveler object-leaf" aria-hidden="true"><img class="leaf-front" src="./art/leaf-front.png" alt="" draggable="false"></div>${panelHTML}`
      :`<div class="object-traveler" aria-hidden="true"><div class="object-portrait"></div></div>${panelHTML}`}`;
  if(!isCat&&!isPhone&&!isLaptop&&!isBook&&!isLeaf){
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
