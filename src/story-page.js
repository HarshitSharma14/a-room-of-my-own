import { projectPageRect, pageDestination, advancePage, pagePose, pageTiming, footTipOnScreen, magicPoint } from './page-motion.js';
import { storyContent } from './story-content.js';
import { soundFX } from './sound-fx.js';

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
          <div class="story-crossword-wrapper">
            <div class="story-crossword-board" role="region" aria-label="Harshit's Origin Story Crossword">
              <div class="story-crossword-banner" hidden>
                <span class="crossword-star">✨</span>
                <span>Crossword Solved! You unlocked Harshit’s Origin Story</span>
              </div>
              <div class="story-crossword-grid"></div>
            </div>
            <div class="story-crossword-clues">
              <div class="crossword-clue-group">
                <h4>ACROSS</h4>
                <ol class="crossword-clue-list" id="clues-across"></ol>
              </div>
              <div class="crossword-clue-group">
                <h4>DOWN</h4>
                <ol class="crossword-clue-list" id="clues-down"></ol>
              </div>
            </div>
          </div>
          <div class="story-rule" aria-hidden="true"></div>
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
  initCrossword(dialog);
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
    soundFX.playPageOpen();
    active=true;direction=1;progress=isStill()||!assetsReady?1:pageTiming.arrival;last=0;
    patch.hidden=!assetsReady;copy.scrollTop=0;
    button.setAttribute('aria-expanded','true');
    dialog.showModal();render();closeButton.focus({preventScroll:true});schedule();
  }
  function close() {
    if(!active||direction<0)return;
    soundFX.playClose();
    direction=-1;last=0;schedule();
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

function initCrossword(dialog) {
  const { rows, cols, words } = storyContent.crossword;
  const gridEl = dialog.querySelector('.story-crossword-grid');
  const acrossList = dialog.querySelector('#clues-across');
  const downList = dialog.querySelector('#clues-down');
  const banner = dialog.querySelector('.story-crossword-banner');
  
  const cellMap = {};
  for (const w of words) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === 'down' ? w.row + i : w.row;
      const c = w.direction === 'across' ? w.col + i : w.col;
      const key = `${r},${c}`;
      if (!cellMap[key]) {
        cellMap[key] = { row: r, col: c, answer: w.answer[i], number: null, words: [] };
      }
      cellMap[key].words.push(w);
      if (i === 0) cellMap[key].number = w.number;
    }
  }

  for (const w of words) {
    const li = document.createElement('li');
    li.dataset.wordId = w.id;
    li.dataset.direction = w.direction;
    li.innerHTML = `<strong>${w.number}.</strong> <span>${w.clue}</span> <em class="clue-len">(${w.answer.length})</em>`;
    li.addEventListener('click', () => focusWord(w));
    if (w.direction === 'across') acrossList.append(li);
    else downList.append(li);
  }

  const inputMap = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      const cellData = cellMap[key];
      const cell = document.createElement('div');
      cell.className = 'crossword-cell';
      
      if (cellData) {
        cell.classList.add('crossword-cell--active');
        if (cellData.number) {
          const numSpan = document.createElement('span');
          numSpan.className = 'cell-num';
          numSpan.textContent = cellData.number;
          cell.append(numSpan);
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'cell-input';
        input.setAttribute('aria-label', `Row ${r+1}, Column ${c+1}`);
        input.dataset.row = r;
        input.dataset.col = c;
        input.dataset.answer = cellData.answer;
        
        input.addEventListener('focus', () => highlightCell(cellData));
        input.addEventListener('input', () => {
          input.value = input.value.toUpperCase();
          soundFX.playClick();
          if (input.value) {
            advanceFocus(cellData);
          }
          checkCompletion();
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value) {
            regressFocus(cellData);
          } else if (e.key === 'ArrowRight') {
            moveBy(cellData, 0, 1);
          } else if (e.key === 'ArrowLeft') {
            moveBy(cellData, 0, -1);
          } else if (e.key === 'ArrowDown') {
            moveBy(cellData, 1, 0);
          } else if (e.key === 'ArrowUp') {
            moveBy(cellData, -1, 0);
          }
        });
        cell.append(input);
        inputMap[key] = input;
      } else {
        cell.classList.add('crossword-cell--blank');
      }
      gridEl.append(cell);
    }
  }

  let activeWord = words[0];

  function highlightCell(cellData) {
    const candidate = cellData.words.find(w => w === activeWord) || cellData.words[0];
    activeWord = candidate;
    updateHighlights();
  }

  function focusWord(w) {
    activeWord = w;
    updateHighlights();
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === 'down' ? w.row + i : w.row;
      const c = w.direction === 'across' ? w.col + i : w.col;
      const inp = inputMap[`${r},${c}`];
      if (inp && !inp.value) {
        inp.focus();
        return;
      }
    }
    const firstInp = inputMap[`${w.row},${w.col}`];
    if (firstInp) firstInp.focus();
  }

  function updateHighlights() {
    dialog.querySelectorAll('.crossword-cell').forEach(c => c.classList.remove('is-word-highlight'));
    dialog.querySelectorAll('.crossword-clue-list li').forEach(li => li.classList.remove('is-active-clue'));
    
    if (!activeWord) return;
    const clueLi = dialog.querySelector(`[data-word-id="${activeWord.id}"]`);
    if (clueLi) clueLi.classList.add('is-active-clue');

    for (let i = 0; i < activeWord.answer.length; i++) {
      const r = activeWord.direction === 'down' ? activeWord.row + i : activeWord.row;
      const c = activeWord.direction === 'across' ? activeWord.col + i : activeWord.col;
      const inp = inputMap[`${r},${c}`];
      if (inp) inp.closest('.crossword-cell').classList.add('is-word-highlight');
    }
  }

  function advanceFocus(cellData) {
    if (!activeWord) return;
    const isDown = activeWord.direction === 'down';
    const nextR = isDown ? cellData.row + 1 : cellData.row;
    const nextC = isDown ? cellData.col : cellData.col + 1;
    const nextInput = inputMap[`${nextR},${nextC}`];
    if (nextInput) nextInput.focus();
  }

  function regressFocus(cellData) {
    if (!activeWord) return;
    const isDown = activeWord.direction === 'down';
    const prevR = isDown ? cellData.row - 1 : cellData.row;
    const prevC = isDown ? cellData.col : cellData.col - 1;
    const prevInput = inputMap[`${prevR},${prevC}`];
    if (prevInput) prevInput.focus();
  }

  function moveBy(cellData, dr, dc) {
    const nextInput = inputMap[`${cellData.row + dr},${cellData.col + dc}`];
    if (nextInput) nextInput.focus();
  }

  let solved = false;
  function checkCompletion() {
    if (solved) return;
    let allCorrect = true;
    for (const [key, cellData] of Object.entries(cellMap)) {
      const inp = inputMap[key];
      if (!inp || inp.value !== cellData.answer) {
        allCorrect = false;
        break;
      }
    }
    if (allCorrect) {
      solved = true;
      soundFX.playLaptopOpen();
      banner.hidden = false;
      dialog.querySelectorAll('.crossword-cell--active').forEach(c => c.classList.add('is-solved'));
    }
  }
}

