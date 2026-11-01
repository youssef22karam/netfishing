// Net-fishing game (waits for window.sea) - part 4/5 (lines 619-837 of the original script). boot.js joins the parts back together.
__ss("game", `
   if(o===cn&&cn){const c0=cn.P[0],m=Math.max(.4,cn.rr*.8),d=H(f.cx,f.cz);if(d>m){f.cx*=m/d;f.cz*=m/d}f.cy=cl(f.cy-dt*.3,cn.ry+.2,c0.y-.2);f.x=c0.x+f.cx;f.z=c0.z+f.cz;f.y=f.cy}
   else if(o===tw&&tw){const c=tw.cd;f.x=c.x+f.cx;f.y=c.y+f.cy;f.z=c.z+f.cz}
   else f.st=3}
  if(f.st===3)dm.scale.set(0,0,0);else{const hs=Math.hypot(f.vx,f.vz);const yw=f.st===1?Math.sin(tm*7+f.ph)*1.2:Math.atan2(f.vx,f.vz),dyw=f.yw===undefined?0:AD(yw,f.yw);f.yw=yw;dm.position.set(f.x,f.y,f.z);dm.rotation.set(Math.atan2(-f.vy,hs||1)*.8,yw,cl(-dyw/dt*.2,-.7,.7));const q=(s.dd>360||H(f.x-bx,f.z-bz)<3.6)?0:sp.vl*s.sz;dm.scale.set(q*sp.sx,q*sp.sy,q);spA.array[k]=f.st===1?2.5:cl(Math.hypot(hs,f.vy)/(sp.sw*.6*s.spm),.5,3);flA.array[k]=cl(f.pn*.9+Math.abs(dyw)/dt*.1,0,1)*(.55+.45*Math.sin(tm*13+f.ph*5))}
  dm.updateMatrix();fm.setMatrixAt(k,dm.matrix)}
 fm.instanceMatrix.needsUpdate=true;spA.needsUpdate=true;flA.needsUpdate=true};

/* ---- bait: chum cloud on the surface; schools within ~170 m swim in and mill around it ---- */
const chum=new THREE.InstancedMesh(new THREE.SphereGeometry(.14,6,5),new THREE.MeshBasicMaterial({color:0xffc9b4,transparent:true,depthTest:false,depthWrite:false}),120);chum.renderOrder=997;chum.frustumCulled=false;chum.count=0;scene.add(chum);
const tCh=gt(g=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,225,205,.7)');r.addColorStop(.6,'rgba(255,200,170,.3)');r.addColorStop(1,'rgba(255,200,170,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const slicks=[0,1,2,3].map(()=>{const m=new THREE.Mesh(pg,dMat(tCh));m.renderOrder=996;m.frustumCulled=false;m.visible=false;scene.add(m);return m});
function throwBait(){if(G.bait<=0){say('No bait left');return}G.bait--;baits.push({x:aim.x,z:aim.z,t:0,life:75});if(baits.length>4)baits.shift();beep(260,.14,.05)}
function chumFx(){let n=0;baits.forEach((b,bi)=>{const k=Math.max(.02,1-b.t/b.life),y=S.S.y*.7+.25;for(let i=0;i<28&&n<120;i++){const a=i*2.4+b.t*.15,r=(.4+i*.22)*(1+b.t*.03);o3.rotation.set(0,0,0);o3.position.set(b.x+Math.cos(a)*r,y+Math.sin(tm*2+i)*.05,b.z+Math.sin(a)*r);o3.scale.setScalar(k);o3.updateMatrix();chum.setMatrixAt(n++,o3.matrix)}
  const sl=slicks[bi];sl.visible=true;sl.position.set(b.x,y,b.z);sl.scale.setScalar(9+b.t*.25);sl.material.opacity=.7*k});
 for(let i=baits.length;i<4;i++)slicks[i].visible=false;chum.count=n;chum.instanceMatrix.needsUpdate=true}

/* ---- seabirds circle shallow / baited schools: the natural cue to find fish ---- */
const bgm=new THREE.BufferGeometry();bgm.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.5,-.9,.05,-.4,0,0,-.2,0,0,.5,0,0,-.2,.9,.05,-.4],3));
const bim=new THREE.InstancedMesh(bgm,new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}),32);bim.frustumCulled=false;scene.add(bim);
const birds=[...Array(32)].map((_,i)=>({a:R()*TAU,r:rt(8,22),h:rt(10,26),w:rt(.5,1.1)*(i%2?1:-1),ph:R()*TAU,k:i%3}));
function birdFx(dt){const L=schools.filter(s=>(s.d<5||s.bt)&&H(s.x-boat.position.x,s.z-boat.position.z)<380).sort((a,b)=>H(a.x-boat.position.x,a.z-boat.position.z)-H(b.x-boat.position.x,b.z-boat.position.z)).slice(0,3);
 birds.forEach((b,i)=>{const s=L[b.k];if(!s)ob.scale.setScalar(0);else{b.a+=b.w*dt;ob.position.set(s.x+Math.cos(b.a)*b.r,b.h+Math.sin(tm*.7+b.ph)*1.5,s.z+Math.sin(b.a)*b.r);ob.rotation.set(0,b.w>0?-b.a:-b.a+Math.PI,Math.sin(tm*9+b.ph)*.5);ob.scale.setScalar(1.3)}ob.updateMatrix();bim.setMatrixAt(i,ob.matrix)});bim.instanceMatrix.needsUpdate=true}

/* ---- radar: only with the fish-finder upgrade, anonymous echoes, no names ---- */
sonar=function(){sx.clearRect(0,0,150,150);const Rg=170+60*lv('sonar'),k=70/Rg,h=boat.heading,bx=boat.position.x,bz=boat.position.z,pr=(x,z)=>{const dx=x-bx,dz=z-bz;return[75+(dx*Math.cos(h)-dz*Math.sin(h))*k,75-(-dx*Math.sin(h)-dz*Math.cos(h))*k]};
 sx.strokeStyle='rgba(127,214,255,.3)';for(const r of[.33,.66,1]){sx.beginPath();sx.arc(75,75,70*r,0,TAU);sx.stroke()}
 sx.fillStyle='rgba(255,255,255,.8)';for(const s of schools){const p=pr(s.x,s.z);if(H(p[0]-75,p[1]-75)>72)continue;sx.beginPath();sx.arc(p[0],p[1],Math.max(2,s.rad*k*.7),0,TAU);sx.fill()}
 sx.strokeStyle='#ffc880';for(const g of gl){sx.beginPath();g.pts.forEach((q,i)=>{const p=pr(q.x,q.z);i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1])});sx.stroke()}
 if(ps){sx.strokeStyle='#ffd27a';sx.beginPath();ps.pts.forEach((q,i)=>{const p=pr(q.x,q.z);i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1])});sx.stroke()}
 if(tw){const p=pr(tw.mc.x,tw.mc.z);sx.fillStyle='#8cf';sx.fillRect(p[0]-2,p[1]-2,4,4)}
 if(cn){const p=pr(cn.P[0].x,cn.P[0].z);sx.strokeStyle='#ffd24a';sx.beginPath();sx.arc(p[0],p[1],Math.max(3,cn.Rn*k),0,TAU);sx.stroke()}
 sx.fillStyle='#ffb02e';for(const b of baits){const p=pr(b.x,b.z);sx.beginPath();sx.arc(p[0],p[1],2.5,0,TAU);sx.fill()}
 sx.fillStyle='#fff';sx.beginPath();sx.moveTo(75,68);sx.lineTo(80,80);sx.lineTo(70,80);sx.fill()};
const tick2g=tick2;tick2=function(dt){tick2g(dt);birdFx(dt);chumFx();stg.forEach(e=>e.style.display='none');document.body.classList.toggle('son',lv('sonar')>0)};

/* ======== v8: tiers + weights, realistic fish/gulls, net sounder, open-sea trawl, condition & repair ======== */
Object.assign(G,{cond:[100,100,100,100],holdKg:0});
SP.forEach((s,i)=>{s.kg=[.12,.5,3,12][i];s.vs=[4.5,4,3,2.4][i];s.vl=s.len*s.vs;s.sx=[.8,.85,1.15,1.25][i];s.sy=[.85,.9,1.1,1.2][i]});

/* ---- difficulty tiers: wider schools, bigger + heavier + faster + shyer fish, worth far more ---- */
const TIERS=[{sz:1,cn:1,spm:1,sk:1},{sz:1.2,cn:1.25,spm:1.12,sk:1.3},{sz:1.45,cn:1.5,spm:1.25,sk:1.7},{sz:1.75,cn:1.8,spm:1.4,sk:2.2}];
const trs=[0,0,0,0,0,1,1,1,1,2,2,3].sort(()=>R()-.5);if(trs[0]!==0){const j=trs.indexOf(0);[trs[0],trs[j]]=[trs[j],trs[0]]}
function addFish(s,k){for(let i=0;i<k&&fish.length<3900;i++){const f={s,sp:s.sp,ox:0,oz:0,oy:0,x:s.x,z:s.z,y:-s.d,vx:0,vz:0,st:0,fl:0,dl:0,fx:0,fz:0,own:null,cx:0,cy:0,cz:0,tw:0,ph:R()*TAU,pn:0,rd:R()*TAU,vy:0,nax:0,nay:0,naz:0,px:s.x,pz:s.z};fish.push(f);s.f.push(f)}}
schools.forEach((s,i)=>{const T=TIERS[trs[i]];s.tier=trs[i];s.sz=T.sz;s.spm=T.spm;s.sk=T.sk;addFish(s,Math.round(s.f.length*(T.cn-1)));
 const n=s.f.length;s.rad=(1.5*Math.cbrt(n)+1)*(1+.1*s.tier);s.thick=Math.min(7,s.rad*.9);const cr=s.sp.sw*.6*s.spm;
 for(const f of s.f){const r=s.rad*.5*Math.cbrt(R()),a=R()*TAU;f.oy=(R()-.5)*s.thick;f.x=f.px=s.x+Math.cos(a)*r;f.z=f.pz=s.z+Math.sin(a)*r;f.y=cl(-s.d+f.oy,FL+.6,-.5);f.vx=Math.cos(s.a)*cr;f.vz=Math.sin(s.a)*cr}});

/* ---- realistic fish: spindle body, forked tail, dorsal + pectoral fins; dark back, silver belly, stripes (mackerel) / spots (cod), sheen flashes ---- */
function fishGeo(){const P=[],K=[],I=[],T=[0,.1,.25,.42,.58,.74,.9,1],RH=[0,.07,.115,.125,.1,.07,.035,.02],RW=[0,.05,.085,.09,.07,.048,.026,.012],NS=6;
 for(let i=0;i<T.length;i++)for(let k=0;k<NS;k++){const t=k/NS*TAU;P.push(Math.cos(t)*RW[i],Math.sin(t)*RH[i],.5-T[i]*.88);K.push(0)}
 for(let i=0;i<T.length-1;i++)for(let k=0;k<NS;k++){const a=i*NS+k,b=i*NS+(k+1)%NS,c=(i+1)*NS+k,d=(i+1)*NS+(k+1)%NS;I.push(a,c,b,b,c,d)}
 const add=(p)=>{P.push(...p);K.push(1);return P.length/3-1},b0=add([0,.02,-.38]),b1=add([0,-.02,-.38]),t0=add([0,.15,-.54]),t1=add([0,-.15,-.54]),n0=add([0,0,-.46]);I.push(b0,t0,n0,b1,n0,t1,b0,n0,b1);
 const d0=add([0,.125,.2]),d1=add([0,.125,-.05]),d2=add([0,.215,-.13]);I.push(d0,d2,d1);
 for(const sg of[-1,1]){const p0=add([sg*.08,-.03,.22]),p1=add([sg*.08,-.05,.12]),p2=add([sg*.17,-.08,.1]);I.push(p0,p1,p2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.setIndex(I);return g}
const bkA=new THREE.InstancedBufferAttribute(new Float32Array(12000),3),blA=new THREE.InstancedBufferAttribute(new Float32Array(12000),3),flA=new THREE.InstancedBufferAttribute(new Float32Array(4000),1),strA=new THREE.InstancedBufferAttribute(new Float32Array(4000),1);
{const g=fishGeo();g.setAttribute('aPh',phA);g.setAttribute('aSp',spA);g.setAttribute('aBack',bkA);g.setAttribute('aBelly',blA);g.setAttribute('aFl',flA);g.setAttribute('aStr',strA);
 const m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,depthTest:false});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=UT;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\\nattribute float aPh;attribute float aSp;attribute float aFl;attribute float aStr;attribute float aK;attribute vec3 aBack;attribute vec3 aBelly;uniform float uT;varying float vFade;varying vec3 vLoc;varying vec3 vBk;varying vec3 vBl;varying float vFl;varying float vStr;varying float vK;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\\nfloat wv=sin(uT*9.0*aSp+aPh-position.z*7.0)*.1*(1.0-smoothstep(-.5,.2,position.z))*(.35+.65*aSp);transformed.x+=wv;transformed.y+=sin(uT*9.0*aSp+aPh)*.01;\\nvLoc=transformed;vBk=aBack;vBl=aBelly;vFl=aFl;vStr=aStr;vK=aK;\\nvec4 wp=instanceMatrix*vec4(transformed,1.0);wp=modelMatrix*wp;vFade=clamp(1.2+wp.y*.05,.42,1.);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\\nvarying float vFade;varying vec3 vLoc;varying vec3 vBk;varying vec3 vBl;varying float vFl;varying float vStr;varying float vK;')
   .replace('#include <color_fragment>','#include <color_fragment>\\nfloat tb=smoothstep(-.04,.07,vLoc.y);vec3 c=mix(vBl,vBk,tb);c+=vec3(.5,.56,.62)*.22*smoothstep(-.015,.0,vLoc.y)*(1.0-smoothstep(.0,.03,vLoc.y));\\nfloat sw=sin(vLoc.z*85.0+vLoc.y*14.0)*.5+.5;float stp=step(.5,vStr)*(1.0-step(1.5,vStr));c*=1.0-stp*step(.025,vLoc.y)*smoothstep(.6,.9,sw)*.5;\\nfloat spt=step(1.5,vStr);float hh=fract(sin(dot(floor(vec2(vLoc.z*55.0,vLoc.y*55.0+vLoc.x*30.0)),vec2(12.9898,78.233)))*43758.5453);c*=1.0-spt*step(.02,vLoc.y)*step(.88,hh)*.5;\\nc=mix(c,c*.6+vec3(.08,.1,.12),vK);c+=vec3(.55)*vFl;\\ndiffuseColor.rgb=mix(vec3(.04,.28,.42),c,vFade);diffuseColor.a*=mix(.4,1.,vFade);')};
 fm.geometry=g;fm.material=m;fm.renderOrder=4}
const SPC=[[[.16,.6,.7],[.92,.95,.97]],[[.13,.66,.52],[.88,.93,.88]],[[.6,.55,.22],[.93,.9,.75]],[[.1,.34,.85],[.82,.88,.96]]];
fish.forEach((f,i)=>{const c=SPC[SP.indexOf(f.sp)],v=.86+R()*.28;for(let j=0;j<3;j++){bkA.array[i*3+j]=cl(c[0][j]*v,0,1);blA.array[i*3+j]=cl(c[1][j]*(.93+R()*.12),0,1)}strA.array[i]=[0,1,2,0][SP.indexOf(f.sp)];phA.array[i]=f.ph});
bkA.needsUpdate=blA.needsUpdate=strA.needsUpdate=phA.needsUpdate=true;fm.count=fish.length;
/* school shadow only (no rings) */
schoolFx=function(){const y=S.S.y*.7+.3;for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z),on=d<420;s.dc.visible=on;s.rp.visible=false;if(!on)continue;s.dc.position.set(s.x,y,s.z);s.dc.scale.setScalar(s.rad*2.1);s.dc.material.opacity=cl(.6*(1-s.d/14),.08,.6)*cl((d-6)/10,.35,1)}};

/* ---- weights ---- */
land=function(list){const by={},m=1+.06*Math.min(G.streak,10);let v=0,kg=0;for(const f of list){f.st=3;f.own=null;const z=Math.pow((f.s&&f.s.sz)||1,3);kg+=f.sp.kg*z;v+=f.sp.v*z*m;G.hb[SP.indexOf(f.sp)]++;by[f.sp.n]=(by[f.sp.n]||0)+1}G.hold+=list.length;G.holdKg+=kg;G.val+=v;beep(660,.1);return list.length+' fish · '+(kg<10?kg.toFixed(1):Math.round(kg))+' kg ('+Object.entries(by).map(e=>e[1]+' '+e[0]).join(', ')+') +$'+Math.round(v)};
const sell8=sell;sell=function(){sell8();G.holdKg=0};

/* ---- net condition, wear, repair, states ---- */
function wear(i,x){const o=G.cond[i];G.cond[i]=Math.max(0,o-x);for(const t of[75,50,25])if(o>t&&G.cond[i]<=t)notify(NETN[i]+' condition '+t+'%');if(G.cond[i]<=0&&o>0)notify(NETN[i]+' is torn')}
const repairCost=i=>Math.ceil((100-G.cond[i])*[.8,1.8,1.6,1.2][i]*(1+.55*G.tier[i]));
const netBusy=i=>[cn,tw,ps,gl.length?1:0][i];
function repair(i){if(netBusy(i)){notify('Haul the '+NETN[i].toLowerCase()+' in first');return}const c=repairCost(i);if(!c)return;if(G.cash<c){notify('Not enough cash to repair');return}G.cash-=c;G.cond[i]=100;beep(520,.15,.05);notify(NETN[i]+' repaired -$'+c)}
function netState(i){const c=G.cond[i];if(c<=0)return['Torn - repair','bad'];
 if(i===0)return cn?[{fly:'In flight',sink:'Sinking',haul:'Hauling'}[cn.st]||'Out','use']:['Ready','ok'];
 if(i===1){if(!tw)return['Ready','ok'];const t=tw.tOut||0,b=tw.n+(tw.vc?tw.vc[0]+tw.vc[1]+tw.vc[2]+tw.vc[3]:0);return[tw.haul?'Hauling in':'Out '+Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+' · '+b+' fish','use']}
 if(i===2)return ps?[ps.st==='set'?'Laying':ps.st==='closed'?'Ring closed':'Pursing','use']:['Ready','ok'];
 return gl.length?[gl.length+' out · '+Math.floor(Math.max(...gl.map(n=>n.hours)))+' h','use']:['Ready','ok']}
const trawlSet8=trawlSet;trawlSet=function(){if(!tw&&G.cond[1]<=0){notify('The trawl is torn');return}trawlSet8()};
const seineSet8=seineSet;seineSet=function(){if(!ps&&G.cond[2]<=0){notify('The purse seine is torn');return}seineSet8()};
const gillAct8=gillAct;gillAct=function(){if(!lay&&G.cond[3]<=0){notify('The gill net is torn');return}gillAct8()};

/* ---- trawl = the open-sea net: it catches scattered fish while you sail, but predators and wear tear it up the longer it is out ---- */
const sea=(x,z)=>cl(.5+.5*Math.sin(x*.0063+1.1)*Math.cos(z*.0057+.4)*(.65+.35*Math.sin((x+z)*.011)),0,1);
function trawlLand(T){const pk=(.35+.65*(T.qh??.6))*(.6+.4*G.cond[1]/100),k=[];for(const f of fish)if(f.own===T&&f.st!==3){if(R()<pk)k.push(f);else{f.st=0;f.own=null;f.fl=5;f.fx=R()-.5;f.fz=R()-.5}}
 (T.vc||[0,0,0,0]).forEach((c,i)=>{for(let j=0;j<c;j++)if(R()<pk)k.push({sp:SP[i],s:{sz:1},st:1,own:null})});return k.length?'Trawl: '+land(k):'Trawl: nothing'}
const trawlStep8=trawlStep;trawlStep=function(dt){const T0=tw;trawlStep8(dt);const T=tw;if(!T){if(T0&&T0.hp<=0)G.cond[1]=0;return}
 T.tOut=(T.tOut||0)+dt;T.vc=T.vc||[0,0,0,0];const v=Math.abs(vEff),vcN=T.vc[0]+T.vc[1]+T.vc[2]+T.vc[3];T.hp-=dt*(.015+.007*v);
 if(v>1.1&&!T.haul&&T.n+vcN<T.cap){const r=.0085*T.W2*T.H2*v*Math.pow(sea(T.mc.x,T.mc.z),2)*(.5+.5*G.cond[1]/100);T.acc=(T.acc||0)+r*dt;
  while(T.acc>=1){T.acc--;const w=T.dep>11?[0,.25,.7,.05]:T.dep>5?[.25,.55,.05,.15]:[.7,.3,0,0];let x=R(),i=0;while(i<3&&x>w[i]){x-=w[i];i++}T.vc[i]++}}
 if(R()<(.003+.00004*T.tOut)*(1+Math.min(2,(T.n+vcN)/T.cap*2))*dt){const k=R();let nm,dmg,loss;if(k<.5){nm='A shark tore into the trawl';dmg=10+R()*10;loss=.15}else if(k<.8){nm='Seals raided the trawl';dmg=5+R()*4;loss=.12}else{nm='An orca shredded the trawl';dmg=20+R()*12;loss=.3}
  T.hp-=dmg*(1-.12*lv('tough'));T.vc=T.vc.map(c=>Math.floor(c*(1-loss)));for(const f of fish)if(f.own===T&&R()<loss){f.st=0;f.own=null;f.fl=5;f.fx=R()-.5;f.fz=R()-.5}T.n=fish.filter(f=>f.own===T).length;beep(95,.4,.09);notify(nm)}
 G.cond[1]=cl(T.hp/(1+.35*lv('tough')),0,100)};

/* ---- depth radar for the trawl (net sounder): side view ahead of the net, fish echoes, seabed, rocks, the net mouth ---- */
eC.width=200;eC.height=110;fe.querySelectorAll('span,b').forEach(e=>e.remove());[0,5,10,15].forEach(d=>fe.insertAdjacentHTML('beforeend','<span style="top:'+(8+d/18*92-5)+'px">'+d+(d?'':'m')+'</span>'));fe.insertAdjacentHTML('beforeend','<b>NET SOUNDER</b>');
const DY=d=>8+d/18*92;
finder=function(dt){if((eT+=dt)<.08)return;eT=0;if(G.net!==1)return;
 const fx=-Math.sin(boat.heading),fz=-Math.cos(boat.heading),T=tw,ox=T?T.mc.x:boat.position.x,oz=T?T.mc.z:boat.position.z,X=a=>44+a*2.1;
 const g=eq.createLinearGradient(0,0,0,110);g.addColorStop(0,'#0b4a63');g.addColorStop(1,'#04121c');eq.fillStyle=g;eq.fillRect(0,0,200,110);
 eq.strokeStyle='rgba(127,214,255,.18)';eq.lineWidth=1;for(const d of[5,10,15]){eq.beginPath();eq.moveTo(0,DY(d));eq.lineTo(200,DY(d));eq.stroke()}
 eq.fillStyle='#5a4a30';eq.fillRect(0,DY(16),200,110);eq.fillStyle='#9aa0aa';
 for(const r of rocks){const a=(r.x-ox)*fx+(r.z-oz)*fz,l=-(r.x-ox)*fz+(r.z-oz)*fx;if(Math.abs(l)<r.r+8&&a>-20&&a<72)eq.fillRect(X(a)-r.r*1.1,DY(-r.top),r.r*2.2,DY(16)-DY(-r.top)+1)}
 const hw=T?T.W2*.5+4:10;
 for(const f of fish){if(f.st!==0)continue;const a=(f.x-ox)*fx+(f.z-oz)*fz;if(a<-20||a>72)continue;const l=-(f.x-ox)*fz+(f.z-oz)*fx;if(Math.abs(l)>hw)continue;
  const inb=T&&a>-3&&a<2&&Math.abs(f.y+T.dep)<T.H2/2;eq.fillStyle=inb?'#fff':'rgba(255,238,170,.85)';eq.fillRect(X(a)-1,DY(-f.y)-1,1+f.sp.vl*.9,2)}
 if(T){const y0=DY(T.dep-T.H2/2),y1=DY(T.dep+T.H2/2);eq.strokeStyle='rgba(127,232,255,.55)';eq.beginPath();eq.moveTo(X(0),y0);eq.lineTo(0,DY(T.dep-T.H2*.18));eq.moveTo(X(0),y1);eq.lineTo(0,DY(T.dep+T.H2*.18));eq.stroke();eq.strokeStyle='#7fe8ff';eq.lineWidth=3;eq.beginPath();eq.moveTo(X(0),y0);eq.lineTo(X(0),y1);eq.stroke()}
 else{eq.fillStyle='#fff';eq.beginPath();eq.moveTo(X(-3),DY(.3));eq.lineTo(X(-3)-4,DY(.3)-6);eq.lineTo(X(-3)+4,DY(.3)-6);eq.fill()}};

/* ---- seagulls with a real body: head + beak, tapered body, forked tail, three-section wings that flap with a wrist wave, soar, fold and plunge-dive ---- */
const GP=[],GC=[],GI=[],gv=(p,c)=>{GP.push(...p);GC.push(...c);return GP.length/3-1};
const Wh=[.97,.98,.99],Gy=[.6,.67,.72],Bk=[.07,.07,.09],Yl=[.96,.76,.1];
{const BR=[[.36,0,0],[.31,.034,.036],[.23,.062,.066],[.1,.076,.08],[-.05,.066,.07],[-.2,.042,.046],[-.3,.016,.02]],NS=6,brs=BR.map(([z,w,h])=>{const a=[];for(let k=0;k<NS;k++){const t=k/NS*TAU;a.push(gv([Math.cos(t)*w,Math.sin(t)*h,z],(Math.sin(t)>.2&&z<.2&&z>-.3)?Gy:Wh))}return a});
 for(let i=0;i<BR.length-1;i++)for(let k=0;k<NS;k++){const a=brs[i][k],b=brs[i][(k+1)%NS],c=brs[i+1][k],d=brs[i+1][(k+1)%NS];GI.push(a,c,b,b,c,d)}
 const tp=gv([0,-.006,.46],Yl),bb=[[-.012,.012],[.012,.012],[.012,-.016],[-.012,-.016]].map(([x,y])=>gv([x,y,.345],Yl));for(let k=0;k<4;k++)GI.push(tp,bb[k],bb[(k+1)%4]);
 {const a=gv([0,.004,-.28],Wh),b=gv([-.075,.004,-.47],Wh),c=gv([.075,.004,-.47],Wh);GI.push(a,b,c,a,c,b)}
 const wx=[.05,.26,.46,.66],wl=[.1,.1,.05,-.03],wt=[-.15,-.13,-.09,-.11];
 for(const sg of[-1,1]){const top=[],bot=[];for(let i=0;i<4;i++){const tip=i===3;top.push([gv([sg*wx[i],.004,wl[i]],tip?Bk:Gy),gv([sg*wx[i],.004,wt[i]],tip?Bk:Gy)]);bot.push([gv([sg*wx[i],-.004,wl[i]],tip?Gy:Wh),gv([sg*wx[i],-.004,wt[i]],tip?Gy:Wh)])}
  for(let i=0;i<3;i++)for(const L of[top,bot]){const[a0,a1]=L[i],[b0,b1]=L[i+1];GI.push(a0,b0,b1,a0,b1,a1)}}}
const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(GP,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(GC,3));gg.setIndex(GI);
const NG=28,gaP=new THREE.InstancedBufferAttribute(new Float32Array(NG),1),gaA=new THREE.InstancedBufferAttribute(new Float32Array(NG),1),gaF=new THREE.InstancedBufferAttribute(new Float32Array(NG),1),gaQ=new THREE.InstancedBufferAttribute(new Float32Array(NG),1);
gg.setAttribute('aPh2',gaP);gg.setAttribute('aAmp',gaA);gg.setAttribute('aFold',gaF);gg.setAttribute('aFq',gaQ);
const gmat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
gmat.onBeforeCompile=sh=>{sh.uniforms.uT=UT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\\nattribute float aPh2;attribute float aAmp;attribute float aFold;attribute float aFq;uniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\\nfloat r=abs(position.x),wing=step(.052,r),r2=max(r-.05,0.),s=clamp(r2/.62,0.,1.),sg=position.x<0.?-1.:1.;\\nfloat flap=sin(uT*aFq+aPh2-s*1.3)*aAmp;float ang=flap*(.25+.75*s)+.12*s*(1.-aFold);\\ntransformed.y=position.y+wing*r2*sin(ang)+sin(uT*aFq+aPh2)*.012*aAmp;\\nfloat rx=mix(.05+r2*cos(ang),.05+r2*.3,aFold);transformed.x=mix(position.x,sg*rx,wing);transformed.z=position.z-wing*aFold*r2*.9;')};
const gm=new THREE.InstancedMesh(gg,gmat,NG);gm.frustumCulled=false;scene.add(gm);bim.visible=false;
const gulls=[...Array(NG)].map((_,i)=>({a:R()*TAU,r:rt(9,24),h:rt(9,20),w:rt(.3,.6)*(i%2?1:-1),ph:R()*TAU,amb:i<8,s:null,st:0,u:0,ft:rt(1,4),fl:R()<.5,amp:.1,fold:0,x:0,y:15,z:0,px:0,py:15,pz:0,sx:0,sy:0,sz:0,tx:0,tz:0,vx:0,vy:0,vz:0,yaw:0,fq:rt(6.5,8.5)}));
const gob=new THREE.Object3D();gob.rotation.order='YXZ';
birdFx=function(dt){const ok=s=>s&&(s.d<4.5||s.bt)&&H(s.x-boat.position.x,s.z-boat.position.z)<400,V=schools.filter(ok);
 gulls.forEach((g,i)=>{let c;if(g.amb)c={x:boat.position.x+Math.sin(g.ph)*10,z:boat.position.z+Math.cos(g.ph)*10,d:9,fd:0,rad:0};else{if(!ok(g.s))g.s=V.length?V[R()*V.length|0]:null;c=g.s}
  if(!c){gob.scale.setScalar(0);gob.updateMatrix();gm.setMatrixAt(i,gob.matrix);return}
  g.ft-=dt;if(g.ft<=0){g.fl=!g.fl;g.ft=g.fl?rt(1.5,3.5):rt(3,7)}
  g.px=g.x;g.py=g.y;g.pz=g.z;const rr=g.amb?g.r*2:g.r;
  if(g.st===0){g.a+=g.w*dt*(g.amb?.6:1);g.x=c.x+Math.cos(g.a)*rr;g.z=c.z+Math.sin(g.a)*rr;g.y=g.h+Math.sin(tm*.6+g.ph)*1.6;
   if(!g.amb&&(c.d<3.8||c.fd)&&R()<.07*dt){g.st=1;g.u=0;g.sx=g.x;g.sy=g.y;g.sz=g.z;g.tx=c.x+rt(-1,1)*(c.rad||4)*.5;g.tz=c.z+rt(-1,1)*(c.rad||4)*.5}}
  else if(g.st===1){g.u+=dt/1.4;const u=Math.min(g.u,1);g.x=g.sx+(g.tx-g.sx)*u;g.z=g.sz+(g.tz-g.sz)*u;g.y=g.sy+(.3-g.sy)*u*u;if(g.u>=1){g.st=2;g.u=0}}
  else if(g.st===2){g.u+=dt;g.y=.3;if(g.u>.4){g.st=3;g.u=0;g.sx=g.x;g.sy=g.y;g.sz=g.z}}
  else{g.u+=dt/2.4;const u=Math.min(g.u,1),ex=c.x+Math.cos(g.a)*rr,ez=c.z+Math.sin(g.a)*rr;g.x=g.sx+(ex-g.sx)*u;g.z=g.sz+(ez-g.sz)*u;g.y=g.sy+(g.h-g.sy)*(1-(1-u)*(1-u));if(u>=1)g.st=0}
  if(dt>0){const k=Math.min(1,dt*6);g.vx+=((g.x-g.px)/dt-g.vx)*k;g.vy+=((g.y-g.py)/dt-g.vy)*k;g.vz+=((g.z-g.pz)/dt-g.vz)*k}
  const hs=Math.hypot(g.vx,g.vz);if(hs>.5)g.yaw=Math.atan2(g.vx,g.vz);
  const bank=g.st===0?Math.atan(hs*hs/(9.8*rr))*(g.w>0?1:-1)*.9:0,ta=g.st===1?0:g.st===2?.6:g.st===3?1:(g.fl?.75:.1);g.amp+=(ta-g.amp)*Math.min(1,dt*4);g.fold+=((g.st===1?1:0)-g.fold)*Math.min(1,dt*8);
  gob.position.set(g.x,g.y,g.z);gob.rotation.set(cl(Math.atan2(-g.vy,hs||1)*.9,-1.1,.9),g.yaw,bank);gob.scale.setScalar(1.35);gob.updateMatrix();gm.setMatrixAt(i,gob.matrix);
  gaP.array[i]=g.ph;gaA.array[i]=g.amp;gaF.array[i]=g.fold;gaQ.array[i]=g.fq});
 gm.instanceMatrix.needsUpdate=true;gaA.needsUpdate=gaF.needsUpdate=true;if(!gaP.n){gaP.needsUpdate=gaQ.needsUpdate=true;gaP.n=1}};

/* ---- per-frame bookkeeping: gill sync, seine predators ---- */
const tick2j=tick2;tick2=function(dt){tick2j(dt);
 if(gl.length)G.cond[3]=cl(Math.min(...gl.map(n=>n.hp))/(1+.4*lv('tough')),0,100);
 if(ps&&(ps.st==='closed'||ps.st==='purse')){ps.pt=(ps.pt||0)+dt;if(R()<.003*(1+ps.pt/20)*dt){wear(2,8+R()*8);let c=0;for(const f of fish)if(f.own===ps&&R()<.07){f.st=0;f.own=null;f.fl=6;f.fx=R()-.5;f.fz=R()-.5;c++}notify('A shark hit the seine');beep(95,.4,.09)}}};

/* ======== v7 UI: quiet, contextual, glass ======== */
document.body.classList.add('hudoff');
document.body.insertAdjacentHTML('beforeend',\`<style>
body #nf,body #nfa,body #nfsh,body #nfm,body #nfk{display:none!important}
body.hudoff #hud{display:none!important}
body #nfs{top:44px;right:8px;width:96px;height:96px;display:none}body.son #nfs{display:block}
body #nfe{display:none;top:236px;left:8px;transform:scale(.75);transform-origin:0 0}body.tw #nfe{display:block}
body #nfg{top:124px;width:min(64vw,280px);padding:7px;background:rgba(10,20,35,.45);border:0;border-radius:12px}body #mgt,body #mgk{display:none}
.gl{background:rgba(14,26,42,.52);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.3);color:#fff;font:600 13px system-ui}
#u1{position:fixed;left:8px;top:44px;display:flex;gap:6px;z-index:6}
#u1 .c{height:38px;border-radius:19px;padding:0 14px;display:flex;align-items:center;gap:7px;white-space:nowrap}
#u1 .c:active{background:rgba(90,170,255,.5)}
#unote{position:fixed;left:8px;top:124px;z-index:6;pointer-events:none;display:flex;flex-direction:column;gap:5px;max-width:64vw}
#unote div{padding:6px 12px;border-radius:12px;font:600 12px/1.25 system-ui;animation:nin .25s ease-out}
@keyframes nin{from{opacity:0;transform:translateX(-14px)}}
#ubar{position:fixed;left:50%;top:124px;width:min(60vw,260px);transform:translateX(-50%);height:14px;border-radius:8px;z-index:6;display:none;padding:2px}
#ubar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#3ad07a,#c6ff6a);width:0}
#ubar u{position:absolute;left:87%;right:2px;top:-3px;bottom:-3px;border:2px solid #fff;border-radius:8px}
#ua{position:fixed;right:8px;top:136px;z-index:6;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.ub{position:relative;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;line-height:1.05;text-align:center;font:800 10px system-ui;letter-spacing:.4px}
.ub b{font-size:20px;font-weight:400;margin-bottom:1px}
.ub:active{background:rgba(90,170,255,.55)}.ub.off{opacity:.35}
#ua .big{width:68px;height:68px;background:rgba(30,110,200,.62)}#ua .mid{width:58px;height:58px}#ua .sm{width:50px;height:50px}
.ub .bd{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ffb02e;color:#111;font:800 11px/20px system-ui;text-align:center;padding:0 4px}
#ux{position:fixed;right:84px;top:136px;z-index:6;display:flex;flex-direction:column;gap:8px}
#ux .ub{width:62px;height:56px;border-radius:16px}
#us{position:fixed;left:0;right:0;bottom:0;max-height:72vh;overflow:auto;z-index:9;display:none;border-radius:20px 20px 0 0;padding:14px 14px 22px;font:500 13px system-ui;background:rgba(10,18,30,.94)}
#us .hd{display:flex;justify-content:space-between;align-items:center;font:800 17px system-ui;margin-bottom:6px}
#us .hd button{height:36px;width:36px;border-radius:18px;font-size:16px}
#us .sec{font:800 11px system-ui;letter-spacing:1px;color:#7fd6ff;margin:14px 0 6px;text-transform:uppercase}
#us .row{display:flex;flex-wrap:wrap;gap:7px}
#us .pill,#us .card,#us .act{border-radius:14px;padding:10px 12px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);color:#fff;font:600 13px system-ui;text-align:left}
#us .pill.on{background:rgba(40,130,230,.55);border-color:#7fd6ff}#us .pill.lock{opacity:.6}
#us .card{width:calc(50% - 4px);display:flex;flex-direction:column;gap:3px}#us .card small{opacity:.7;font-weight:500}
#us .card .pips{letter-spacing:2px;color:#ffb02e}#us .card.max{opacity:.55}
#us .act{width:100%;background:rgba(60,170,110,.3);margin-bottom:6px}
#unets{position:fixed;left:8px;top:88px;display:flex;gap:5px;z-index:6}
#unets .np{display:flex;align-items:center;gap:4px;height:28px;padding:0 9px;border-radius:14px;font-size:13px}
#unets .np i{display:block;width:26px;height:5px;border-radius:3px;background:rgba(255,255,255,.22);overflow:hidden}#unets .np u{display:block;height:100%}
#unets .np.on{background:rgba(40,130,230,.6);border-color:#7fd6ff}#unets .np.use{box-shadow:0 0 0 1px #7fd6ff inset}#unets .np.bad{border-color:#ff6a5a}
#us .nrow{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:10px 12px;margin-bottom:7px;background:rgba(255,255,255,.06)}#us .nrow.on{border-color:#7fd6ff;background:rgba(40,130,230,.25)}
#us .nh{display:flex;justify-content:space-between;align-items:center}#us .nh small{opacity:.75}
#us .nbar{height:6px;border-radius:3px;background:rgba(255,255,255,.15);margin:7px 0;overflow:hidden}#us .nbar u{display:block;height:100%}
#us .nf{display:flex;justify-content:space-between;align-items:center}
#us .tg{display:flex;justify-content:space-between;align-items:center;padding:9px 2px;border-bottom:1px solid rgba(255,255,255,.1)}
</style>\`);
const d7=(tag,id,cls,html)=>{const e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
const NETN=['Cast net','Trawl net','Purse seine','Gill net'],NETI=['🎣','🚢','⭕','📏'],SIZEN=['Small','Medium','Large','Huge'],MESHN=['Fine','Medium','Coarse','Heavy'];
/* quiet RDR2-style notifications (results and damage only, never instructions) */
const unote=d7('div','unote');document.body.append(unote);
const OKM=/fish|\\$|cash|caught|damag|torn|tore|ripped|snag|rock|Sold|CONTRACT|Skipped|ycatch|hark|lost|destroyed|PERFECT|GREAT|GOOD|\\bOK\\b|MISS|slipped|Too early|bait|ran out/i;
function notify(t){const e=d7('div','','gl',t);unote.append(e);while(unote.children.length>3)unote.firstChild.remove();setTimeout(()=>{e.style.transition='opacity .5s';e.style.opacity=0;setTimeout(()=>e.remove(),500)},4200)}
say=function(t){if(OKM.test(t))notify(t)};
/* top chips */
const u1=d7('div','u1'),chipNet=d7('button','','c gl'),chipCash=d7('div','','c gl'),chipMenu=d7('button','','c gl','☰');u1.append(chipNet,chipCash,chipMenu);document.body.append(u1);
chipNet.onclick=()=>cyc();
const unets=d7('div','unets');document.body.append(unets);unets.innerHTML=NETI.map((x,i)=>'<div class="np gl" data-i='+i+'><span>'+x+'</span><i><u></u></i></div>').join('');unets.addEventListener('pointerdown',e=>{e.stopPropagation();const p=e.target.closest('.np');if(p)G.net=+p.dataset.i});
/* meter bar (throw timing) */
const ubar=d7('div','ubar','gl','<i></i><u></u>');document.body.append(ubar);
/* action buttons with contextual names */
const uA=d7('div','ua'),uX=d7('div','ux');
const mkBtn=(par,cls,icon,label,f)=>{const b=d7('div','','ub gl '+cls,'<b>'+icon+'</b><span>'+label+'</span>');f(b);par.append(b);return b};
const bAct=mkBtn(uA,'big','🎣','THROW',b=>{b.onpointerdown=e=>{e.preventDefault();act(true)};b.onpointerup=b.onpointercancel=()=>act(false)});
const bHaul=mkBtn(uA,'mid','🪢','HAUL',b=>{b.onpointerdown=e=>{e.preventDefault();if(!MG.on)haul();if(MG.on)MGpress(true)};b.onpointerup=b.onpointercancel=()=>MGpress(false)});
`);
