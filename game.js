(()=>{
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
let W=800,H=520,active=false,remaining=60,cash=0,last=0,raf=0,keys={},touch={},best=+(localStorage.getItem('beastBest')||0);
$('best').textContent='$'+best;
function resize(){let r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);W=canvas.width;H=canvas.height;ctx.setTransform(d,0,0,d,0,0);W=r.width;H=r.height}
window.addEventListener('resize',resize);resize();
const world={w:24,d:24};
let hero,bots,coins,rollers;
function reset(){hero={x:0,z:5,cash:0,color:'#29d8ff',name:'YOU',speed:7};bots=Array.from({length:5},(_,i)=>({x:(i-2)*2,z:-3-i%2*2,cash:0,color:['#ff6060','#b58cff','#ffad4c','#ff70b8','#a5e65b'][i],speed:4.5+Math.random()*1.5,think:0,tx:0,tz:0}));coins=Array.from({length:22},()=>({x:Math.random()*20-10,z:Math.random()*20-10}));rollers=Array.from({length:4},(_,i)=>({x:-9+i*6,z:Math.random()*12-6,v:2.5+i*.25}));remaining=60;cash=0}
function project(x,y,z){let scale=470/(z+16);return {x:W/2+x*scale,y:H*.48+(z-1)*scale*.72-y*scale,s:scale}}
function box(x,z,w,d,h,color){let p=project(x,0,z),s=p.s;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(p.x-w*s/2,p.y);ctx.lineTo(p.x+w*s/2,p.y);ctx.lineTo(p.x+w*s/2,p.y+d*s*.22);ctx.lineTo(p.x-w*s/2,p.y+d*s*.22);ctx.closePath();ctx.fill();ctx.fillStyle='#0002';ctx.fillRect(p.x-w*s/2,p.y-h*s,w*s,h*s);ctx.fillStyle=color;ctx.fillRect(p.x-w*s/2,p.y-h*s,w*s,h*s)}
function draw(){ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#70cbed');sky.addColorStop(.6,'#b5e8ed');sky.addColorStop(1,'#d9c58c');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // distant island silhouettes
 for(let i=0;i<7;i++){let p=project((i-3)*7,0,-8);ctx.fillStyle=i%2?'#378c70':'#2d795e';ctx.beginPath();ctx.arc(p.x,p.y-25,45,Math.PI,0);ctx.fill()}
 let ground=project(0,0,0);ctx.fillStyle='#c5ae70';ctx.beginPath();ctx.moveTo(W*.03,H*.48);ctx.lineTo(W*.97,H*.48);ctx.lineTo(W*1.4,H);ctx.lineTo(-W*.4,H);ctx.closePath();ctx.fill();
 for(let i=-12;i<=12;i+=2){let a=project(i,0,-10),b=project(i,0,13);ctx.strokeStyle='#a58f5d66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 for(let z=-10;z<=13;z+=2){let a=project(-12,0,z),b=project(12,0,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 // platforms and palm-like props
 for(let i=0;i<8;i++){let x=(i%4-1.5)*6,z=Math.floor(i/4)*15-7,p=project(x,0,z);ctx.fillStyle='#277e55';ctx.beginPath();ctx.arc(p.x,p.y-12,18*p.s/25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a643d';ctx.fillRect(p.x-3,p.y-24,6,18)}
 coins.forEach(c=>{let p=project(c.x,.5,c.z);ctx.fillStyle='#ffcf35';ctx.beginPath();ctx.ellipse(p.x,p.y-8*p.s/20,7*p.s/20,10*p.s/20,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#80520c';ctx.font=`bold ${Math.max(7,10*p.s/20)}px Arial`;ctx.textAlign='center';ctx.fillText('$',p.x,p.y-5*p.s/20)});
 rollers.forEach(r=>{let p=project(r.x,.2,r.z);ctx.fillStyle='#d83f45';ctx.beginPath();ctx.arc(p.x,p.y-8*p.s/20,14*p.s/20,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffaaaa';ctx.lineWidth=2;ctx.stroke()});
 [...bots,hero].sort((a,b)=>b.z-a.z).forEach(p=>{let q=project(p.x,0,p.z),s=Math.max(.5,q.s/20);ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(q.x,q.y,13*s,5*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=p.color;ctx.fillRect(q.x-9*s,q.y-25*s,18*s,20*s);ctx.fillStyle='#f0c5a0';ctx.beginPath();ctx.arc(q.x,q.y-32*s,8*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#26344b';ctx.beginPath();ctx.arc(q.x,q.y-35*s,8*s,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='white';ctx.font=`bold ${Math.max(9,11*s)}px Arial`;ctx.textAlign='center';ctx.fillText(p.name,q.x,q.y-43*s)});
 ctx.fillStyle='#173047';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText('BEAST ISLAND • CASH RUSH',14,20)}
function move(p,dx,dz,dt){let m=Math.hypot(dx,dz);if(m){p.x+=dx/m*p.speed*dt;p.z+=dz/m*p.speed*dt}p.x=Math.max(-11,Math.min(11,p.x));p.z=Math.max(-11,Math.min(11,p.z))}
function tick(dt){remaining=Math.max(0,remaining-dt);let dx=(keys.ArrowRight||keys.d||touch.right?1:0)-(keys.ArrowLeft||keys.a||touch.left?1:0),dz=(keys.ArrowDown||keys.s||touch.down?1:0)-(keys.ArrowUp||keys.w||touch.up?1:0);move(hero,dx,dz,dt);
 bots.forEach(b=>{b.think-=dt;if(b.think<=0){b.think=.4+Math.random()*.6;let t=coins.reduce((a,c)=>Math.hypot(c.x-b.x,c.z-b.z)<Math.hypot(a.x-b.x,a.z-b.z)?c:a,coins[0]);b.tx=t.x;b.tz=t.z}move(b,b.tx-b.x,b.tz-b.z,dt)});
 rollers.forEach(r=>{r.x+=r.v*dt;if(r.x>11||r.x< -11)r.v*=-1});
 [hero,...bots].forEach(p=>{coins.forEach((c,i)=>{if(Math.hypot(c.x-p.x,c.z-p.z)<.85){p.cash+=100;coins[i]={x:Math.random()*20-10,z:Math.random()*20-10}}});rollers.forEach(r=>{if(Math.hypot(r.x-p.x,r.z-p.z)<.9){p.x+=(p.x-r.x)*.5;p.z+=(p.z-r.z)*.5}})});
 cash=hero.cash;$('cash').textContent='$'+cash.toLocaleString();$('time').textContent=Math.ceil(remaining);
 if(remaining<=0)finish()}
function loop(t){if(!active)return;let dt=Math.min((t-last)/1000||0,.04);last=t;tick(dt);draw();if(active)raf=requestAnimationFrame(loop)}
function finish(){active=false;cancelAnimationFrame(raf);best=Math.max(best,hero.cash);localStorage.setItem('beastBest',best);$('best').textContent='$'+best;$('headline').textContent='CHALLENGE COMPLETE!';let winner=[hero,...bots].sort((a,b)=>b.cash-a.cash)[0];$('intro').textContent=`${winner.name} wins with $${winner.cash.toLocaleString()}. Your score: $${hero.cash.toLocaleString()}. Your best score is saved on this device.`;$('start').textContent='PLAY AGAIN';$('overlay').classList.remove('hide')}
function start(){reset();active=true;$('overlay').classList.add('hide');$('cash').textContent='$0';$('time').textContent='60';last=performance.now();draw();raf=requestAnimationFrame(loop)}
$('start').onclick=start;$('restart').onclick=start;
window.addEventListener('keydown',e=>{keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()});window.addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('[data-m]').forEach(b=>{let d=b.dataset.m;b.addEventListener('pointerdown',e=>{e.preventDefault();touch[d]=true;b.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>touch[d]=false))});
draw();
})();