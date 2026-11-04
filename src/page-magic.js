import { clamp } from './scene-math.js';
import { magicPoint, pageTiming } from './page-motion.js';

// Decorative, deterministic particles share the page's reversible clock.
// No timers, external assets, pointer targets, or persistent particle loops.
export function createPageMagic(canvas) {
  const ctx=canvas.getContext('2d');
  function star(x,y,r,angle,alpha,color='#ffe6a0') {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=alpha;
    ctx.fillStyle=color;ctx.beginPath();
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4, length=i%2?r*.24:r;
      const px=Math.cos(a)*length,py=Math.sin(a)*length;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();ctx.restore();
  }
  function glow(x,y,r,alpha) {
    const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
    gradient.addColorStop(0,`rgba(255,239,182,${alpha})`);
    gradient.addColorStop(.25,`rgba(249,199,108,${alpha*.35})`);
    gradient.addColorStop(1,'rgba(249,199,108,0)');
    ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  return {
    draw(progress,start,end,rect,enabled) {
      if(!ctx)return;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);
      if(!enabled||progress<pageTiming.launch-.04||progress>=pageTiming.sparkleEnd)return;
      ctx.translate(-rect.left,-rect.top);
      const charge=clamp((progress-(pageTiming.launch-.04))/.04,0,1);
      const release=1-clamp((progress-pageTiming.launch)/.1,0,1);
      glow(...start,24,charge*release*.85);
      for(let i=0;i<34;i++) {
        const delay=i*.003, age=progress-pageTiming.launch-delay;
        if(age<0)continue;
        const at=magicPoint(progress,start,end,delay);
        const t=clamp(age/(pageTiming.arrival-pageTiming.launch),0,1);
        const life=1-clamp((progress-pageTiming.arrival-delay)/.07,0,1);
        const spread=Math.sin(t*Math.PI)*Math.sin(i*2.399)*10;
        const alpha=life*(.45+.5*Math.sin(i*1.7+progress*45)**2);
        if(alpha<=0)continue;
        const x=at[0]+Math.sin(i*1.9)*Math.abs(spread)*.35,y=at[1]+spread;
        if(i%5===0)glow(x,y,11,alpha*.45);
        star(x,y,i%4===0?5:2.2+(i%3)*.6,progress*7+i,alpha,i%6===0?'#d5fff1':'#ffe6a0');
      }
      if(progress>=pageTiming.launch&&progress<=pageTiming.arrival) {
        const head=magicPoint(progress,start,end);
        glow(...head,24,.85);star(...head,8,progress*5,1,'#fff5d3');
      }
      const hit=clamp((progress-pageTiming.arrival)/(pageTiming.sparkleEnd-pageTiming.arrival),0,1);
      if(hit>0&&hit<1) {
        const alpha=Math.sin(hit*Math.PI);
        glow(...end,20+hit*18,alpha*.8);
        for(let i=0;i<9;i++) {
          const angle=i*Math.PI*2/9, radius=8+hit*34;
          star(end[0]+Math.cos(angle)*radius,end[1]+Math.sin(angle)*radius,4*(1-hit)+1,angle+hit,alpha*.8);
        }
      }
    },
  };
}
