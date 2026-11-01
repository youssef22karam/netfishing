// Net-fishing game (waits for window.sea) - part 2/5 (lines 220-396 of the original script). boot.js joins the parts back together.
__ss("game", `
  else if(n===2)s=ps?ps.st==='set'?'laying '+ps.used.toFixed(0)+'/'+ps.L+' m · back to the buoy ('+H(stern()[0]-ps.bx,stern()[1]-ps.bz).toFixed(0)+' m)':ps.st==='closed'?'RING CLOSED - PURSE (G)':'pursing '+Math.round(ps.tp*100)+'%':gs?'Ring (green=your net is long enough): need ~'+Math.round(2*Math.PI*(gs.rad+6)*1.1)+' m, you have '+SZ[2][t]+' m · school '+gs.n+' '+gs.sp.n+' · alarm '+Math.round(gs.al*100)+'%':'Find a school (sonar), approach slowly, F to drop the buoy';
  else s=lay?'laying '+lay.used+'/'+lay.L+' m':'mesh '+SP[G.mesh].n+' · density here x'+hot(boat.position.x,boat.position.z).toFixed(1)+' · '+gl.length+' set · F lay, J soak 3h, G haul';
  $('#nft').innerHTML='<b>'+NM[n]+'</b> size '+(t+1)+'/'+(G.max[n]+1)+' ('+SZ[n][t]+'m) · $'+G.cash+' · '+G.hold+' fish ($'+G.val+')';
  const k=$('#nfk');k.style.display=chOn?'block':'none';k.firstChild.style.width=ch*100+'%'}}
const r0=S.renderer.render.bind(S.renderer);let lt=performance.now();
S.renderer.render=(sc2,c)=>{if(sc2===scene){const n=performance.now(),dt=Math.min((n-lt)/1000,.05);lt=n;try{tick(dt);tick2(dt)}catch(e){console.error('nets',e)}}return r0(sc2,c)};


/* ======== v2: mini-games, guide, new trawl, gillnet rework, fish finder, contracts ======== */
Object.assign(G.up,{crew:0,sensor:0,helm:0});UP.push(['crew','Crew skill',110],['sensor','Net sensor',160],['helm','Autohelm',140]);Object.assign(G,{streak:0,best:0,hb:[0,0,0,0]});
document.head.insertAdjacentHTML('beforeend',\`<style>
#nf{max-height:52vh;overflow:auto}#nfc{color:#ffd24a;font-weight:700;margin:4px 0;line-height:1.35}#nfq{color:#9fe;margin-top:3px}
#nfg{position:fixed;left:50%;top:132px;transform:translateX(-50%);width:min(86vw,360px);background:rgba(10,18,30,.92);border:1px solid #7fd6ff;border-radius:14px;padding:10px;z-index:7;display:none;text-align:center;font:600 13px system-ui}
#mgb{position:relative;height:22px;background:#1b2b3d;border-radius:11px;margin:10px 0}#mgb i{position:absolute;top:0;bottom:0;background:rgba(78,224,138,.6);border-radius:11px}#mgb u{position:absolute;top:-4px;bottom:-4px;width:6px;margin-left:-3px;background:#fff;border-radius:3px}
#mgp{height:6px;background:#1b2b3d;border-radius:3px}#mgp i{display:block;height:100%;width:0;background:#ffd24a;border-radius:3px}
#mgk{margin-top:8px;width:100%;padding:14px;font:700 15px system-ui;background:#2d6cdf;color:#fff;border:0;border-radius:12px;touch-action:none}
#nfe{position:fixed;left:8px;top:56px;z-index:5;font:9px monospace;color:#9cd}#nfe canvas{display:block;background:#04121c;border:1px solid #7fd6ff;border-radius:6px}#nfe span{position:absolute;left:2px}#nfe b{position:absolute;right:4px;top:1px;font-size:8px;opacity:.7}
#nfgd{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,520px);max-height:78vh;overflow:auto;background:rgba(8,16,28,.97);border:1px solid #7fd6ff;border-radius:14px;padding:12px;font:12px/1.5 system-ui;z-index:9;display:none}
#nfgd button{background:#244;color:#fff;border:1px solid #7fd6ff;border-radius:8px;padding:6px 8px;margin:2px;font:inherit}#nfgd ol{padding-left:18px;margin:6px 0}#nfgd b{color:#7fd6ff}
</style>\`);
let ac;const beep=(f,d=.12,v=.05)=>{try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(1e-3,ac.currentTime+d);o.stop(ac.currentTime+d)}catch(e){}};
const grade=q=>q>.93?'PERFECT!':q>.75?'GREAT':q>.5?'GOOD':q>.25?'OK':'MISS';
const newCt=()=>{const i=R()*4|0,need=Math.round([110,66,36,18][i]*rt(.8,1.3));G.ct={i,need,rew:Math.round(need*SP[i].v*rt(1.6,2.1))}};newCt();
const tgt=()=>{let b=1e9,r=null;for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z);if(d<b&&d<260){b=d;r=s}}return r&&{s:r,d:b}};
function settle(own,q,tag){const l=fish.filter(f=>f.own===own&&f.st!==3),k=l.filter(()=>R()<(.35+.65*q)*(.6+.4*G.cond[own===tw?1:0]/100));for(const f of l)if(!k.includes(f)){f.st=0;f.own=null;f.fl=5;f.fx=R()-.5;f.fz=R()-.5}return tag+(k.length?land(k):'nothing')+(l.length>k.length?' · '+(l.length-k.length)+' slipped out':'')}
land=function(list){const by={},m=1+.06*Math.min(G.streak,10);let v=0;for(const f of list){f.st=3;f.own=null;G.hb[SP.indexOf(f.sp)]++;v+=Math.round(f.sp.v*m);by[f.sp.n]=(by[f.sp.n]||0)+1}G.hold+=list.length;G.val+=v;beep(660,.1);return list.length+' fish ('+Object.entries(by).map(e=>e[1]+' '+e[0]).join(', ')+') ~$'+v+(m>1?' (streak x'+m.toFixed(2)+')':'')};
sell=()=>{let p=Math.round(G.val*cl(G.rep/100,.5,1.1)),m='';const c=G.ct;if(G.hb[c.i]>=c.need){p+=c.rew;m=' + CONTRACT BONUS $'+c.rew+'!';newCt()}G.cash+=p;say('Sold '+G.hold+' fish for $'+p+m);G.hold=0;G.val=0;G.hb=[0,0,0,0];beep(880,.2)};

/* ---------- skill mini-games: tension (hold G / button), react (tap when it flashes) ---------- */
const mgd=document.createElement('div');mgd.id='nfg';mgd.innerHTML='<div id=mgt></div><div id=mgb><i></i><u></u></div><div id=mgp><i></i></div><button id=mgk></button>';document.body.append(mgd);
const mE={t:$('#mgt'),b:$('#mgb'),z:$('#mgb i'),m:$('#mgb u'),pw:$('#mgp'),p:$('#mgp i'),k:$('#mgk')},MG={on:false,t:'',prog:0,q:.5,v:.5,hold:false};
mE.k.onpointerdown=e=>{e.stopPropagation();MGpress(true)};mE.k.onpointerup=mE.k.onpointerleave=()=>MGpress(false);mgd.addEventListener('pointerdown',e=>e.stopPropagation());
function mg(t,title,cb,o={}){Object.assign(MG,{on:true,t,cb,v:.5,hold:false,prog:0,time:0,off:0,snaps:0,sn:0,go:false,hard:o.hard||.6,dur:o.dur||5,wait:.7+R()*1.5,rt:0,lim:o.lim||1.1,w:.18*(1+.1*lv('crew')),ph:R()*6});
 mgd.style.display='block';mE.t.textContent=title;mE.b.style.display=mE.pw.style.display=t==='tension'?'block':'none';mE.k.textContent=t==='tension'?'HOLD to pull (or hold G)':'wait for the flash...';mE.k.style.background='';beep(520,.08)}
function mgStep(dt){if(!MG.on)return;MG.time+=dt;
 if(MG.t==='tension'){const bw=MG.w*1.3+.05+.02*lv('winch'),c=.5+.2*Math.sin(MG.time*1.3+MG.ph),lo=c-bw/2,hi=c+bw/2;
  MG.v=cl(MG.v+((MG.hold?1.5:-1.1)+Math.sin(MG.time*7.1+MG.ph)*MG.hard*1.4*(.6+.4*Math.sin(MG.time*2.3)))*dt*.55,0,1);
  if(MG.v>=lo&&MG.v<=hi)MG.prog+=dt/MG.dur;else{MG.off+=dt;MG.prog=Math.max(0,MG.prog-dt/MG.dur*.35)}
  if(MG.v>.97){MG.sn+=dt;if(MG.sn>.5){MG.sn=0;MG.snaps++;MG.prog=Math.max(0,MG.prog-.2);MG.v=.55;beep(140,.25,.08);}}else MG.sn=0;
  mE.z.style.left=lo*100+'%';mE.z.style.width=bw*100+'%';mE.m.style.left=MG.v*100+'%';mE.p.style.width=Math.min(1,MG.prog)*100+'%';
  if(MG.prog>=1)mgFin(cl(1-.15*MG.snaps-.7*MG.off/Math.max(MG.time,1),.2,1));else if(MG.time>MG.dur*2.6)mgFin(cl(.4*MG.prog,0,.4))}
 else{if(!MG.go&&MG.time>MG.wait){MG.go=true;MG.rt=MG.time;mE.k.textContent='NOW!!';mE.k.style.background='#e0452d';beep(900,.1)}if(MG.go&&MG.time-MG.rt>MG.lim*(1+.1*lv('crew')))mgFin(0)}}
function MGpress(d){if(!MG.on)return;if(MG.t==='tension'){MG.hold=d;return}if(d){if(!MG.go)mgFin(0,'Too early!');else mgFin(cl(1-(MG.time-MG.rt-.2)/(MG.lim*(1+.1*lv('crew'))),0,1))}}
function mgFin(q,msg){MG.on=false;MG.q=q;mgd.style.display='none';G.streak=q>=.7?G.streak+1:0;G.best=Math.max(G.best,G.streak);say((msg||grade(q))+(G.streak>1?' · streak x'+G.streak:''));beep(300+q*600,.15);const cb=MG.cb;MG.cb=null;cb&&cb(q)}
function castClose(){const n=cn;if(!n||n.st!=='sink')return;const t=(n.cov||0)+(n.und||0);n.qc=t?n.cov/t:0;n.st='haul';n.mgd=0;mg('tension','HAUL: hold G to pull - keep the marker in the green',q=>{n.qh=q;n.mgd=1},{dur:4.5,hard:.7})}
haul=function(){if(MG.on){MGpress(true);MGpress(false);return}const n=G.net;
 if(n===0)castClose();
 else if(n===1){const T=tw;if(T&&!T.haul){T.haul=true;T.tw=8;T.mgd=0;mg('tension','WINCH: hold G to haul in - keep the marker in the green',q=>{T.qh=q;T.mgd=1},{dur:5,hard:.5+.9*T.n/T.cap})}}
 else if(n===2){if(ps){if(ps.st==='closed'){ps.st='purse';ps.tp=0;for(const w of ps.pts)w.o=null;mg('tension','PURSE THE NET: hold G - keep the marker in the green',()=>{},{dur:6,hard:.8})}else if(ps.st==='set'){say('Seine recovered, nothing caught');endSeine()}}}
 else if(!gillHaul())say('Get within 35 m of a gillnet to haul it')};

/* ---------- TRAWL v2: the net trails the boat's wake. depth = warp x sin(angle), angle from tow speed ---------- */
let trail=[],sNow=0;
const tAt=d=>{const s=sNow-d;let i=trail.length-1;while(i>0&&trail[i].s>s)i--;const a=trail[i],b=trail[Math.min(i+1,trail.length-1)],u=b.s>a.s?cl((s-a.s)/(b.s-a.s),0,1):0;return{x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u}};
const dirAt=d=>{const a=tAt(d),b=tAt(d+2),l=H(a.x-b.x,a.z-b.z)||1;return[(a.x-b.x)/l,(a.z-b.z)/l]};
trawlSet=function(){if(tw)return say('Net already out - HAUL (G) first');
 const W=SZ[1][G.tier[1]],[fx,fz]=bf(),[sx0,sz0]=stern(3.2);trail=[];sNow=300;for(let i=300;i>=0;i-=3)trail.push({x:sx0-fx*i,z:sz0-fz*i,s:sNow-i});
 tw={id:++twId,W,Hh:W*.5,wl:30,tw:30,hp:Math.max(1,G.cond[1])*(1+.35*lv('tough')),n:0,cap:180+270*G.tier[1],haul:false,snag:false,imm:0,dep:1,of:.1,W2:0,H2:0,my:-1,mc:{x:sx0,y:-1,z:sz0},cd:{x:sx0,y:-1,z:sz0},ln:mkLines(260,0xcfe8ff),mgd:1,qh:.6,auto:false,ov:0};
 say('Net shot! It trails behind you. Match NET DEPTH to the school depth: Q = deeper, E = shallower')};
trawlStep=function(dt){const T=tw,[sx0,sz0]=stern(3.2),v=Math.abs(vEff),l=trail[trail.length-1],dd=H(sx0-l.x,sz0-l.z);
 if(dd>.6){sNow+=dd;trail.push({x:sx0,z:sz0,s:sNow});if(trail.length>700)trail.shift()}
 T.wl+=cl(T.tw-T.wl,-dt*(10+4*lv('winch')),dt*10);
 const th=Math.atan2(2.4,Math.max(v,.2)),sn=Math.max(Math.sin(th),.25),tg0=tgt();
 if(T.auto&&lv('sensor')&&tg0)T.tw=cl(tg0.s.d/sn,6,110);
 T.dep+=(Math.min(T.wl*Math.sin(th),-FL-T.H2/2-.2)-T.dep)*Math.min(1,dt*.55);
 const of=cl((v-.8)/2.2,.12,1);T.of+=(of-T.of)*Math.min(1,dt*1.5);T.W2=T.W*T.of;T.H2=T.Hh*(.55+.45*T.of);
 const hd=Math.max(7,T.wl*Math.cos(th)*.9+8),mp=tAt(hd),[ax,az]=dirAt(hd),ux=az,uz=-ax,Lb=T.W*.75;
 T.mc.x=mp.x;T.mc.z=mp.z;T.mc.y=T.my=-T.dep;const cp=tAt(hd+Lb*3.2);T.cd.x=cp.x;T.cd.z=cp.z;T.cd.y=-T.dep-.3;T.hd=hd;
 const vl=7.2-.12*T.W+.3*lv('tough');if(v>vl){T.hp-=(v-vl)*5*dt;if(!T.ov){T.ov=1;say('TOO FAST - the net is tearing! Ease the throttle')}}else T.ov=0;
 if(T.imm>0)T.imm-=dt;T.snag=false;
 for(const r of rocks)if(H(mp.x-r.x,mp.z-r.z)<r.r+T.W2*.3&&-T.dep-T.H2/2<r.top){T.snag=true;if(T.imm<=0){T.imm=5;T.hp-=14*(1-.12*lv('tough'));T.tw=Math.max(8,T.tw-14);beep(110,.3,.08);say('Net caught on a rock and damaged')}}
 if(T.hp<=0){say('Net torn off - catch lost!');for(const f of fish)if(f.own===T){f.st=0;f.own=null;f.fl=5;f.fx=R()-.5;f.fz=R()-.5}kill(T.ln);tw=null;return}
 for(const f of fish){if(f.st!==0||f.tw===T.id)continue;const dx=f.x-mp.x,dz=f.z-mp.z;if(Math.abs(dx)>40||Math.abs(dz)>40)continue;const A=dx*ax+dz*az;if(A<-1.6||A>.7)continue;
  const L=dx*ux+dz*uz,V=f.y+T.dep;if(Math.abs(L)<T.W2*.5&&Math.abs(V)<T.H2*.5){f.tw=T.id;const p=cl((v*1.1+.4)/(f.sp.sw*f.s.spm*1.2),.06,.96)*(T.n<T.cap?1:0);
   if(R()<p){f.st=1;f.own=T;f.cx=(R()-.5)*2.4;f.cy=(R()-.5)*1.6;f.cz=(R()-.5)*2.4;T.n++}else{f.fl=3;f.fx=ux*(L>0?1:-1);f.fz=uz*(L>0?1:-1)}}}
 if(T.haul&&T.wl<15&&T.mgd){say(trawlLand(T));kill(T.ln);tw=null;return}
 const o=[],by=boat.position.y+1.2,fr=(d,k)=>{const a=tAt(d),[qx,qz]=dirAt(d),r=[];for(let i=0;i<8;i++){const an=i*TAU/8,lx=Math.cos(an)*T.W2/2*k,ly=Math.sin(an)*T.H2/2*k;r.push([a.x+qz*lx,-T.dep+ly,a.z-qx*lx])}return r},rs=[fr(hd,1),fr(hd+Lb,.82),fr(hd+Lb*2,.55),fr(hd+Lb*3,.3)];
 rs.forEach((q,k)=>{for(let i=0;i<8;i++){const a=q[i],b=q[(i+1)%8];o.push([...a,...b]);if(k<3)o.push([...a,...rs[k+1][(i+1)%8]])}});
 for(const a of rs[3])o.push([...a,T.cd.x,T.cd.y,T.cd.z]);
 for(const j of[1,-1]){let p0=null;for(let t=0;t<=1.001;t+=.2){const d=(hd-5)*t,a=tAt(d),[qx,qz]=dirAt(d),lat=(1.3+(T.W2/2+4-1.3)*t)*j,p=[a.x+qz*lat,by+(-T.dep-by)*Math.pow(t,.7),a.z-qx*lat];if(p0)o.push([...p0,...p]);p0=p}(T.bd=T.bd||[])[j>0?0:1]=p0;o.push([...p0,...rs[0][j>0?0:4]],[p0[0],p0[1]-1.2,p0[2],p0[0],p0[1]+1.2,p0[2]])}
 T.rs=rs;setL(T.ln,o)};

/* ---------- GILLNET v2: fishes in real time while you play (1 game hour = 20 s); tags float over the buoys ---------- */
function gillHour(n){n.hours++;const hs=hot(n.pts[0].x,n.pts[0].z),di=1+.45*Math.cos((hr()-6)*TAU/12);
 SP.forEach((sp,i)=>{const mt=Math.exp(-Math.pow(Math.log(sp.len/MESH[n.mesh]),2)/(2*.09)),ov=Math.max(0,Math.min(n.D,sp.d[1])-sp.d[0])/(sp.d[1]-sp.d[0]);n.c[i]+=[26,14,8,3][i]*(n.L/100)*mt*ov*hs*di*(.6+.8*R())});
 if(n.hours>6&&R()<.14*(n.hours-6)/6){n.hp-=25+R()*20;n.c=n.c.map(v=>v*.7);say('Shark tore a gillnet! Go haul it soon');beep(120,.4,.08)}
 if(R()<.02*n.hours*(n.D<=8?1.6:1)){n.by++;say('Bycatch (turtle/dolphin) tangled in a gillnet - fines if you leave it')}}
const mkTag=()=>{const e=document.createElement('div');e.style.cssText='position:fixed;pointer-events:none;transform:translate(-50%,-100%);background:rgba(10,18,30,.84);border:1px solid #ffc880;border-radius:8px;padding:3px 6px;font:600 10px system-ui;white-space:nowrap;z-index:4;display:none';document.body.append(e);return e};
const gillAct0=gillAct;gillAct=function(){const had=!!lay;gillAct0();if(!had&&lay){lay.acc=0;lay.tg=mkTag()}};
soak=function(){if(!gl.length)return say('No gillnet out yet: pick Gillnet (N), press F and drive straight to lay it');lay=null;for(let h=0;h<3;h++){S.P.hour=(hr()+1)%24;gl.forEach(gillHour)}say('Skipped 3 hours')};
gillHaul=function(){const[x,z]=stern(0);let n=null;for(const g of gl)if(g.pts.some(p=>H(p.x-x,p.z-z)<35))n=g;if(!n)return false;if(MG.on)return true;
 mg('tension','HAULING THE GILLNET: hold G - keep the marker in the green',q=>{const l=n.c.map(v=>Math.floor(v*(.45+.55*q))),k=l.reduce((a,b)=>a+b,0),v=l.reduce((s,c,i)=>s+c*SP[i].v,0);G.hold+=k;G.val+=v;G.holdKg+=l.reduce((s,c,i)=>s+c*SP[i].kg,0);l.forEach((c,i)=>G.hb[i]+=c);let m='Gillnet ('+n.hours.toFixed(1)+'h): '+k+' fish +$'+Math.round(v);if(n.by){G.rep=Math.max(0,G.rep-10*n.by);G.cash-=80*n.by;m+=' · BYCATCH x'+n.by+' fine $'+80*n.by+', rep '+G.rep}G.cond[3]=cl(n.hp/(1+.4*lv('tough')),0,100);if(n.hp<=0)m+=' · net destroyed';kill(n.ln);if(n.tg)n.tg.remove();gl=gl.filter(g=>g!==n);say(m)},{dur:4,hard:.5});return true};
const v3=new THREE.Vector3();
function tags(){gl.forEach((n,i)=>{if(!n.tg)return;const p=n.pts[0];v3.set(p.x,2.5,p.z).project(cam);const d=H(p.x-boat.position.x,p.z-boat.position.z);if(v3.z>1||d>900){n.tg.style.display='none';return}
 const est=n.c.reduce((a,b)=>a+b,0),sh=n.hours>6?Math.round(14*(n.hours-6)/6):0,by=Math.min(60,Math.round(2*n.hours*(n.D<=8?1.6:1))),risk=Math.max(sh,by);
 Object.assign(n.tg.style,{display:'block',left:(v3.x+1)/2*innerWidth+'px',top:(1-v3.y)/2*innerHeight+'px',borderColor:risk>25?'#f55':risk>10?'#fb4':'#4e8'});n.tg.textContent='Net '+(i+1)+' · '+n.hours.toFixed(1)+'h'})}

/* ---------- fish finder (echo sounder): scrolls right-to-left, shows fish depth, seabed, rocks and your net's depth ---------- */
const fe=document.createElement('div');fe.id='nfe';fe.innerHTML='<canvas width=160 height=90></canvas><span style="top:0">0m</span><span style="top:21px">5</span><span style="top:42px">10</span><span style="top:63px">15</span><b>FISH FINDER</b>';document.body.append(fe);
const eC=fe.firstChild,eq=eC.getContext('2d');let eT=0;
function finder(dt){if((eT+=dt)<.09)return;eT=0;eq.drawImage(eC,-1,0);const x=159,Y=y=>6+(-y)/18*76,g=eq.createLinearGradient(0,0,0,90);g.addColorStop(0,'#0b4a63');g.addColorStop(1,'#04121c');eq.fillStyle=g;eq.fillRect(x,0,1,90);
 const bx=boat.position.x,bz=boat.position.z;eq.fillStyle='#5a4a30';eq.fillRect(x,Y(FL),1,90);
 for(const r of rocks)if(H(r.x-bx,r.z-bz)<r.r+3){eq.fillStyle='#9aa0aa';eq.fillRect(x,Y(r.top),1,90)}
 for(const f of fish){if(f.st===3)continue;const dx=f.x-bx,dz=f.z-bz;if(Math.abs(dx)>14||Math.abs(dz)>14||H(dx,dz)>10-f.y*.4)continue;eq.fillStyle='#'+f.sp.c.toString(16).padStart(6,'0');eq.fillRect(x-(R()<.5?1:0),Y(f.y)-1,2,2)}
 let nd=null;if(tw)nd=[-tw.dep-tw.H2/2,-tw.dep+tw.H2/2];else if(ps)nd=[-ps.D,0];else if(cn&&cn.st!=='fly')nd=[cn.ry,0];
 if(nd){eq.fillStyle='rgba(255,255,255,.9)';eq.fillRect(x,Y(nd[1]),1,Math.max(1,Y(nd[0])-Y(nd[1])))}}
const sonar0=sonar;sonar=function(){sonar0();const k=70/(150+50*lv('sonar')),h=boat.heading;sx.font='9px monospace';sx.fillStyle='#fff';for(const s of schools){const dx=s.x-boat.position.x,dz=s.z-boat.position.z,u=75+(dx*Math.cos(h)-dz*Math.sin(h))*k,v=75-(-dx*Math.sin(h)-dz*Math.cos(h))*k;if(H(u-75,v-75)<62)sx.fillText(s.sp.n[0]+s.d.toFixed(0)+'m',u+4,v-4)}};

/* ---------- Autohelm (steering assist for the seine ring) + entry marker ---------- */
let hErr=0;const ent=new THREE.Mesh(new THREE.SphereGeometry(.9,12,8),new THREE.MeshBasicMaterial({color:0x66ffaa,transparent:true,opacity:.8,depthTest:false}));ent.renderOrder=999;ent.visible=false;scene.add(ent);
const seineSet0=seineSet;seineSet=function(){seineSet0();const T=tgt();if(ps&&T&&T.d<130){ps.gs=T.s;ps.r0=T.s.rad+6}};
function helm(dt){hErr=0;if(!(ps&&ps.st==='set'&&ps.gs))return;const c=ps.gs,r=ps.r0,px=boat.position.x,pz=boat.position.z,d=H(px-c.x,pz-c.z)||1,rx=(px-c.x)/d,rz=(pz-c.z)/d,[fx,fz]=bf();let tx=-rz,tz=rx;if(tx*fx+tz*fz<0){tx=-tx;tz=-tz}
 const k=cl((d-r)/r,-1,1)*1.6;let e=Math.atan2(-(tx-rx*k),-(tz-rz*k))-boat.heading;e=Math.atan2(Math.sin(e),Math.cos(e));hErr=e;if(lv('helm')>1)boat.heading+=cl(e,-1,1)*dt*.45*(lv('helm')-1)}
const autoD=()=>{if(!lv('sensor'))return say('Needs the Net sensor upgrade (shop U): it holds the school depth for you');if(!tw)return say('Shoot the trawl first');tw.auto=!tw.auto;say('Depth lock '+(tw.auto?'ON - warp follows the school depth':'OFF'))};

/* ---------- coach: what to do next, which net suits the target school ---------- */
const suit=(n,s)=>{const t=G.tier[n];
 if(n===0){const re=(1.6+.6*lv('lead'))*(.5/s.sp.k+SZ[0][t]*.6/(s.sp.sw*1.5));return s.d+.5<=re?[1,'in cast reach ('+re.toFixed(1)+' m)']:[0,'too deep for the cast net (reach '+re.toFixed(1)+' m: bigger net / Lead line)']}
 if(n===1)return[1,'tow >= '+(s.sp.sw*1.1*1.944).toFixed(1)+' kn to outswim it'];
 if(n===2){const D=[8,11,14,17][t];return D>=s.d+3?[1,'net hangs '+D+' m, below it']:[0,'net only '+D+' m: it dives under (buy a deeper size)']}
 const D=[6,8,10,13][t];return D>=s.d?[1,'wall '+D+' m covers it']:[0,'wall '+D+' m too shallow']};
const steer=()=>Math.abs(hErr)<.12?'✓ on the ring':hErr>0?'◀ steer LEFT':'steer RIGHT ▶';
function coach(){const n=G.net,T=tgt(),t=G.tier[n];let c='',s='';
 s=T?'🎯 '+T.s.sp.n+' ×'+T.s.n+' · depth '+T.s.d.toFixed(0)+' m · '+T.d.toFixed(0)+' m away · '+(suit(n,T.s)[0]?'✓ ':'✗ ')+suit(n,T.s)[1]+(T.s.fl>0?' · FLEEING':''):'No school within 200 m: follow the sonar blips (letter+depth)';
 if(n===0)c=MG.on?'':!cn?(chOn?'② Release F at the END of the bar (green) = full spread':'① Stop the boat. Put the ring over the school (green = fish under it), HOLD F'):cn.st==='fly'?'...':cn.st==='sink'?'③ CLOSE with G when covered ≈ under net: '+cn.cov+' / '+(cn.cov+cn.und)+(cn.cov>0&&cn.und<=Math.max(1,cn.cov*.25)?'  ← NOW!':''):'④ Hold G, keep the marker in the green';
 else if(n===1){if(!tw)c='① Sail 3-5 kn toward the school, then press F to shoot the net';else{const v=Math.abs(vEff)*1.944,df=T?T.s.d+.0-tw.dep:0,ok=T&&Math.abs(df)<=tw.H2/2+.8;
  s+='\\nnet depth '+tw.dep.toFixed(1)+' m (warp '+tw.wl.toFixed(0)+'→'+tw.tw+') · mouth '+tw.W2.toFixed(0)+'×'+tw.H2.toFixed(0)+' m · '+v.toFixed(1)+' kn · mesh '+Math.round(tw.hp/(100*(1+.35*lv('tough')))*100)+'% · bag '+tw.n+'/'+tw.cap;
  c=MG.on?'':tw.haul?'⑥ Winch: hold G':(T&&!ok?(df>0?'② Net too SHALLOW: pay out warp (Q)':'② Net too DEEP: haul warp in (E)'):'')+(ok?'✓ On depth! ':'')+(T&&v<T.s.sp.sw*1.1*1.944?' ③ Faster! fish outswim you':' ③ Steer so the net passes over the school')+'  ·  G = haul when full'}}
 else if(n===2)c=MG.on?'':!ps?(T?'① Drive SLOWLY to the green marker, press F. Ring needs ~'+Math.round(2*Math.PI*(T.s.rad+6)*1.1)+' m of net (you have '+SZ[2][t]+')':'① Find a school on the sonar'):ps.st==='set'?'② '+steer()+' · '+ps.used.toFixed(0)+'/'+ps.L+' m laid · close within 18 m of the buoy ('+H(stern()[0]-ps.bx,stern()[1]-ps.bz).toFixed(0)+' m)':ps.st==='closed'?'③ RING CLOSED - press G to PURSE':'④ Hold G';
 else c=lay?'① Drive STRAIGHT while it pays out ('+lay.used+'/'+lay.L+' m). F again = finish':gl.length?'② Go fish elsewhere: nets fill by themselves (1 game hour = 20 s). Haul with G within 35 m. J = skip 3 h':'① Pick MESH (M) = fish size, press F and drive straight to lay it. Density here x'+hot(boat.position.x,boat.position.z).toFixed(1);
 return[c,s+(n===3?'\\nmesh '+SP[G.mesh].n+' · '+gl.length+' net(s) out':'')]}

/* ---------- guide ---------- */
const gd=document.createElement('div');gd.id='nfgd';document.body.append(gd);gd.addEventListener('pointerdown',e=>e.stopPropagation());
const GH=['<b>CAST NET</b> - a hand-thrown round net with lead weights. Best for small fish in the top few metres (sardines). Pure skill, no engine needed.<ol><li><b>Stop the boat</b> near a school (noise = they flee). The target line says if it is "in cast reach".</li><li><b>Aim</b>: move the pointer/finger. The white ring is the net, it turns green when fish are under it.</li><li><b>HOLD F</b> (or ACT): the inner ring grows/shrinks. <b>Release at the END of the bar</b> for 100% spread.</li><li><b>Sink</b>: fish bolt after ~0.5 s. Press <b>G (CLOSE)</b> when "covered" ≈ "under net". Early misses deep fish, late and they flee.</li><li><b>Haul</b>: hold G, keep the marker inside the moving green band. Smooth = fewer fish slip out.</li></ol>Upgrades: Lead line (sinks faster = deeper reach) · Crew skill (wider windows) · Winch (wider band) · Mesh (rock tears).',
'<b>TRAWL</b> - a cone net towed BEHIND the boat. Best for deep/bottom fish (cod) and big mackerel hauls. Fish must be at the net depth.<ol><li>Read the school <b>depth</b> (sonar label, target line, FISH FINDER top-left: coloured dots = fish, white = your net).</li><li>Sail 3-5 kn, press <b>F</b> to shoot. Net depth = warp length × speed: <b>faster = shallower</b>.</li><li><b>Q</b> pay out warp (deeper) / <b>E</b> haul in (shallower) until the white band sits on the fish dots. The coach tells you. <b>Net sensor</b> upgrade + X holds depth automatically.</li><li><b>Steer over the school</b> and tow faster than the fish swim (target line shows kn). Too fast tears the net.</li><li><b>Rocks</b> (grey): when SNAG flashes, tap instantly to lift the net.</li><li><b>G</b> = haul: winch mini-game, hold G to keep the marker in green. Heavy bag = harder.</li></ol>',
'<b>PURSE SEINE</b> - a long wall of net laid in a circle around a school, then closed like a purse. Biggest hauls, hardest driving.<ol><li>Find a school. The <b>green ring</b> is the circle to drive (red = net too short or too shallow: fish dive under). Size up in the shop.</li><li>Approach <b>slowly</b> (alarm shows on the sonar). Stop at the <b>green marker</b>, press <b>F</b>: the buoy drops.</li><li>Drive the ring (coach arrow helps; Autohelm L2+ steers for you). <b>Faster = fewer escapes</b> (the newest net is shallow) but noisier. Best 5-6 m/s. Return within 18 m of the buoy.</li><li>Ring closed: <b>G</b> then hold G in the green band. Quality decides how many fish stay.</li></ol>Upgrades: Lead line (net sinks quicker) · Stealth · Engine · Autohelm.',
'<b>GILLNET</b> - a standing wall of mesh. Fish swim in and get stuck by the gills. It is PASSIVE: it fills while you do other things.<ol><li>Check the <b>density</b> here (hot spots) and the fish depth. Pick <b>MESH (M)</b> = fish size (Sardine/Mackerel/Cod/Tuna). Wrong mesh = few fish.</li><li>Press <b>F</b> and drive <b>straight</b>; longer = more fish. F again to finish. A tag floats over the net.</li><li><b>Go fish elsewhere!</b> Every net fishes in real time (1 game hour = 20 s). <b>J = skip 3 hours</b> if you just want to wait (day/night passes).</li><li>Return within 35 m, <b>G</b> to haul (mini-game). Dawn/dusk fish best.</li></ol><b>Risk</b>: after ~6 h sharks tear the net and bycatch (turtles) costs fines and reputation. Tag colour: green safe, red = haul now!',
'<b>WHICH NET?</b><br>Sardine 1-5 m $2: cast net, purse seine<br>Mackerel 3-9 m $5: purse seine, trawl (mid-water), gillnet M<br>Cod 12-15 m (bottom) $9: <b>trawl on the bottom</b>, deep gillnet<br>Tuna 4-10 m $24, fast + shy: purse seine (Stealth!), big trawl ≥ 4 kn<br><b>UPGRADES</b>: Engine (speed) · Lead line (sink) · Stealth (noise) · Winch/Mesh/Crew (easier mini-games) · Sonar (range) · Sensor (trawl auto-depth) · Autohelm (ring steering)<br><b>LOOP</b>: sell with H · contracts pay big bonuses · perfect mini-games build a STREAK that boosts every fish price · bigger nets need a faster boat and more skill.'];
function guideR(i){gd.dataset.tab=i;gd.innerHTML=['Cast','Trawl','Purse','Gill','Fish'].map((t,k)=>'<button data-i='+k+'>'+t+'</button>').join('')+'<button data-i=x style="float:right">Close ✕</button><div style="margin-top:8px">'+GH[i]+'</div>'}
gd.onclick=e=>{const b=e.target.closest('button');if(!b)return;b.dataset.i==='x'?gd.style.display='none':guideR(+b.dataset.i)};
const guideT=(o,i)=>{const open=o===undefined?gd.style.display!=='block':o;gd.style.display=open?'block':'none';if(open)guideR(i??G.net)};
for(const[t,fn]of[['Guide Y',()=>guideT()],['Auto X',autoD]]){const b=document.createElement('button');b.textContent=t;b.onclick=fn;$('#nfb').append(b)}
$('#nfi').insertAdjacentHTML('beforebegin','<div id=nfq></div><div id=nfc></div>');
const shop0=shop;shop=function(o){shop0(o);const p=$('#nfp');if(p.style.display==='block')p.insertAdjacentHTML('beforeend','<div style="margin-top:6px;opacity:.8">Engine: faster boat · Lead: net sinks faster · Stealth: quieter · Winch/Mesh/Crew: easier mini-games · Sonar: range · Sensor: trawl auto-depth · Autohelm: ring steering</div>')};
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyY')guideT();else if(e.code==='KeyX')autoD()});

let c2=0,lastNet=-1;const seen={};
function tick2(dt){mgStep(dt);helm(dt);finder(dt);tags();
 for(const n of gl){if(n===lay)continue;n.acc=(n.acc||0)+dt/20;while(n.acc>=1){n.acc--;gillHour(n)}}
 const T=tgt(),y=S.S.y*.7+.3;
 if(G.net===2&&!ps&&T&&T.d<160){const c=T.s,r=c.rad+6,dx=boat.position.x-c.x,dz=boat.position.z-c.z,d=H(dx,dz)||1;ent.visible=true;ent.position.set(c.x+dx/d*r,.6,c.z+dz/d*r)}else ent.visible=false;
 if(ps&&ps.st==='set'&&ps.gs){guide.visible=true;guide.position.set(ps.gs.x,y,ps.gs.z);guide.scale.setScalar(ps.r0);guide.material.color.set(0x66ffaa)}
 if(G.net!==lastNet){lastNet=G.net;seen[G.net]=1;}
 if((c2+=dt)>.15){c2=0;const[c,s]=coach(),k=G.ct;$('#nfc').textContent=c;$('#nfi').innerText=s;$('#nfq').textContent='📋 '+k.need+' '+SP[k.i].n+' → +$'+k.rew+' (have '+G.hb[k.i]+') · streak x'+G.streak+' (best '+G.best+')'}}

/* ======== v3: phone-friendly HUD (slim strip, thumb buttons, menu sheet, touch auto-aim, tow limiter) ======== */
document.body.insertAdjacentHTML('beforeend',\`<style>
body #nf{left:6px;right:auto;top:154px;width:min(94vw,430px);max-height:none;overflow:visible;padding:4px 8px;background:rgba(8,16,28,.55);font-size:10.5px;pointer-events:none;border-radius:10px}
body #nfi{white-space:pre-wrap;line-height:1.25;margin:2px 0}body #nfc{margin:2px 0}body #nfk{height:16px;margin:4px 0}
body #nfs{top:38px;right:6px;width:112px;height:112px;pointer-events:none}
body #nfe{top:50px;left:6px;transform:scale(.8);transform-origin:0 0;pointer-events:none}
body #nfm{top:238px;font-size:12px}body #nfg{top:238px}
#nfa{position:fixed;right:8px;top:238px;z-index:6;display:grid;grid-template-columns:52px 52px;gap:6px}
#nfa button{height:52px;border-radius:14px;border:2px solid rgba(255,255,255,.5);background:rgba(20,50,90,.82);color:#fff;font:700 11px system-ui;line-height:1.15;touch-action:none;padding:0}
#nfa button:active{background:rgba(60,120,200,.95)}
#nfsh{position:fixed;left:8px;right:8px;bottom:8px;max-height:64vh;overflow:auto;background:rgba(8,16,28,.97);border:1px solid #7fd6ff;border-radius:14px;padding:10px;z-index:9;display:none;font:12px ui-monospace,monospace;color:#fff}
#nfsh b{color:#7fd6ff}#nfsh .r{display:flex;flex-wrap:wrap}#nfsh button{background:rgba(40,60,90,.85);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:10px;margin:3px;font:inherit}
</style>\`);
const touch=matchMedia('(pointer:coarse)').matches;let hud=true;
const sh=document.createElement('div');sh.id='nfsh';sh.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><b>NET MENU</b><button id=nfx>Close ✕</button></div>';document.body.append(sh);
sh.append($('#nfq'),$('#nfb'),$('#nfp'));$('#nfx').onclick=()=>sh.style.display='none';sh.addEventListener('pointerdown',e=>e.stopPropagation());
{const b=document.createElement('button');b.textContent='Hide/show HUD';b.onclick=()=>{hud=!hud;for(const e of['#nf','#nfs','#nfe'])$(e).style.display=hud?'':'none'};$('#nfb').append(b)}
const ca=document.createElement('div');ca.id='nfa';
const mkB=(t,f)=>{const b=document.createElement('button');b.innerHTML=t;f(b);ca.append(b);return b};
const act=d=>{if(MG.on)MGpress(d);else d?actDown():actUp()};
mkB('ACT<br>hold',b=>{b.onpointerdown=e=>{e.preventDefault();act(true)};b.onpointerup=b.onpointercancel=()=>act(false)});
`);
