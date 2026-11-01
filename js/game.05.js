// Net-fishing game (waits for window.sea) - part 5/5 (lines 838-876 of the original script). boot.js joins the parts back together.
__ss("game", `
const bBait=mkBtn(uA,'sm','🪱','BAIT',b=>{b.onpointerdown=e=>{e.preventDefault();throwBait()}});bBait.insertAdjacentHTML('beforeend','<span class=bd></span>');
const bLo=mkBtn(uX,'','⬇','LOWER',b=>b.onpointerdown=e=>{e.preventDefault();G.net===1?warp(1):G.net===3?mesh():0}),bHi=mkBtn(uX,'','⬆','RAISE',b=>b.onpointerdown=e=>{e.preventDefault();G.net===1?warp(-1):G.net===3?soak():0});
document.body.append(uA,uX);for(const e of[u1,uA,uX])e.addEventListener('pointerdown',ev=>ev.stopPropagation());
const lab=(b,ic,t,on)=>{const k=ic+t;if(b.k!==k){b.k=k;b.firstChild.textContent=ic;b.children[1].textContent=t}b.classList.toggle('off',!on)};
function labels(){const n=G.net;let a,h,hp=1,ap=1,x=0;
 if(n===0){a=['🎣','THROW'];if(cn){ap=0;h=cn.st==='sink'?['🪢','CLOSE']:['🪢','PULL']}else{h=['🪢','CLOSE'];hp=0}}
 else if(n===1){a=['🚢',tw?'NET OUT':'SET NET'];ap=!tw;h=['⚙️','HAUL'];hp=!!tw;x=tw?['⬇','LOWER','⬆','RAISE']:0}
 else if(n===2){a=['⭕',ps?'NET OUT':'DROP NET'];ap=!ps;h=ps?(ps.st==='closed'?['🪢','PURSE']:ps.st==='purse'?['🪢','PULL']:['✖','CANCEL']):['🪢','PURSE'];hp=!!ps}
 else{a=lay?['✅','DONE']:['📏','LAY NET'];h=['🪢','PULL NET'];hp=gl.length>0;x=['🧵','MESH: '+MESHN[G.mesh].toUpperCase(),'⏩','SKIP 3H']}
 lab(bAct,a[0],a[1],ap);lab(bHaul,h[0],h[1],hp);
 uX.style.display=x?'flex':'none';if(x){lab(bLo,x[0],x[1],1);lab(bHi,x[2],x[3],1)}
 bBait.lastElementChild.textContent=G.bait;bBait.classList.toggle('off',G.bait<=0);
 [...unets.children].forEach((p,i)=>{const st=netState(i),c=G.cond[i];p.className='np gl'+(i===n?' on':'')+(st[1]==='use'?' use':'')+(c<=0?' bad':'');const b=p.querySelector('u');b.style.width=c+'%';b.style.background=c>60?'#4ee08a':c>25?'#ffb02e':'#ff5a4a'});
 chipNet.textContent=NETI[n]+' '+NETN[n];chipCash.textContent='$'+Math.round(G.cash)+(G.hold?'  ·  🐟 '+Math.round(G.holdKg)+' kg':'')+(G.streak>1?'  ·  🔥'+G.streak:'')}
/* menu sheet */
const uS=d7('div','us','gl');document.body.append(uS);uS.addEventListener('pointerdown',e=>e.stopPropagation());
const UPI={eng:['🚤','Engine','Faster boat'],lead:['⚓','Lead weights','Nets sink faster'],stealth:['🤫','Quiet engine','Fish spook less'],winch:['⚙️','Winch','Easier hauling'],tough:['🧵','Strong mesh','Nets resist damage'],sonar:['📡','Fish finder','See fish below'],crew:['🧑‍🤝‍🧑','Deckhands','Forgiving timing'],sensor:['🎯','Depth sensor','Trawl follows the fish'],helm:['🧭','Autohelm','Helps circle a school']};
function sheet(open){if(open===undefined)open=uS.style.display!=='block';uS.style.display=open?'block':'none';if(!open)return;const n=G.net,k=G.ct;
 uS.innerHTML='<div class=hd><span>Fishing</span><button class=gl data-c=1>✕</button></div>'+
 '<div class=sec>Nets</div>'+NETN.map((x,i)=>{const st=netState(i),c=Math.round(G.cond[i]),rc=repairCost(i);return'<div class="nrow'+(i===n?' on':'')+'" data-net='+i+'><div class=nh><span>'+NETI[i]+' <b>'+x+'</b></span><small>'+st[0]+'</small></div><div class=nbar><u style="width:'+c+'%;background:'+(c>60?'#4ee08a':c>25?'#ffb02e':'#ff5a4a')+'"></u></div><div class=nf><span>'+c+'% condition</span>'+(rc>0?(netBusy(i)?'<span style="opacity:.6">In use</span>':'<button class=pill data-repair='+i+'>Repair · $'+rc+'</button>'):'<span style="opacity:.6">Perfect</span>')+'</div></div>'}).join('')+
 '<div class=sec>Size</div><div class=row>'+[0,1,2,3].map(i=>{const own=i<=G.max[n];return'<button class="pill'+(i===G.tier[n]?' on':'')+(own?'':' lock')+'" data-size='+i+'>'+(own?'':'🔒 ')+SIZEN[i]+' · '+SZ[n][i]+' m'+(own?'':' · $'+TC[i])+'</button>'}).join('')+'</div>'+
 '<div class=sec>Upgrades</div><div class=row>'+UP.map(u=>{const l=lv(u[0]),m=l>=5,i=UPI[u[0]];return'<button class="card'+(m?' max':'')+'" data-up='+u[0]+'><span>'+i[0]+' <b>'+i[1]+'</b></span><small>'+i[2]+'</small><span class=pips>'+'●'.repeat(l)+'○'.repeat(5-l)+'</span><span>'+(m?'MAX':'$'+upC(u[0]))+'</span></button>'}).join('')+'</div>'+
 '<div class=sec>Market</div><button class=act data-sell=1>Sell catch · '+G.hold+' fish · $'+Math.round(G.val*cl(G.rep/100,.5,1.1))+'</button>'+
 '<div style="opacity:.8;margin:2px 0 8px">Order: '+k.need+' '+SP[k.i].n+' · +$'+k.rew+' bonus ('+G.hb[k.i]+' so far)</div>'+
 '<button class=act data-bait=1>🪱 Buy 10 bait · $25 <span style="opacity:.7">(you have '+G.bait+')</span></button>'+
 '<div class=sec>Time</div><button class=act data-skip=1>⏩ Skip 3 hours</button>'+
 '<div class=sec>Controls</div><div class=tg><span>Game panel (weather, time, camera)</span><button class="pill'+(document.body.classList.contains('hudoff')?'':' on')+'" data-panel=1>'+(document.body.classList.contains('hudoff')?'Hidden':'Shown')+'</button></div>'+
 '<div class=tg><span>How to fish</span><button class=pill data-guide=1>Open</button></div>'}
chipMenu.onclick=()=>sheet();
uS.onclick=e=>{const b=e.target.closest('button')||e.target.closest('.nrow');if(!b)return;const d=b.dataset;
 if(d.c){sheet(false);return}
 if(d.repair!==undefined)repair(+d.repair);else if(d.net!==undefined)G.net=+d.net;
 else if(d.size!==undefined){const i=+d.size,n=G.net;if(i<=G.max[n])G.tier[n]=i;else if(i===G.max[n]+1){if(G.cash>=TC[i]){G.cash-=TC[i];G.max[n]=i;G.tier[n]=i}else notify('Not enough cash')}else notify('Not enough cash for that size yet')}
 else if(d.up){const c=upC(d.up);if(lv(d.up)>=5)return;if(G.cash>=c){G.cash-=c;G.up[d.up]++}else notify('Not enough cash')}
 else if(d.sell)sell();else if(d.bait){if(G.cash>=25){G.cash-=25;G.bait+=10}else notify('Not enough cash')}
 else if(d.skip)soak();else if(d.panel)document.body.classList.toggle('hudoff');else if(d.guide){sheet(false);guideT(true)}
 sheet(true)};
let t6=0;
const tick2h=tick2;tick2=function(dt){tick2h(dt);ubar.style.display=chOn?'block':'none';ubar.firstChild.style.width=ch*100+'%';document.body.classList.toggle('tw',G.net===1);if((t6+=dt)>.12){t6=0;labels()}};
`);
