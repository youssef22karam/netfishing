// Net-fishing game (waits for window.sea) - part 3/5 (lines 397-618 of the original script). boot.js joins the parts back together.
__ss("game", `
mkB('HAUL<br>hold',b=>{b.onpointerdown=e=>{e.preventDefault();if(!MG.on)haul();if(MG.on)MGpress(true)};b.onpointerup=b.onpointercancel=()=>MGpress(false)});
const bNet=mkB('NET',b=>b.onclick=()=>cyc());
mkB('☰<br>menu',b=>b.onclick=()=>sh.style.display=sh.style.display==='block'?'none':'block');
const bX=mkB('',b=>b.onclick=()=>G.net===1?warp(1):G.net===3?mesh():0),bY=mkB('',b=>b.onclick=()=>G.net===1?warp(-1):G.net===3?soak():0);document.body.append(ca);
let l3='';function ui3(){const n=G.net;if(n===l3)return;l3=n;bNet.innerHTML='NET<br>'+['Cast','Trawl','Seine','Gill'][n];const xs=[['',''],['DEEPER','SHALLOWER'],['',''],['MESH','WAIT 3h']][n];[bX,bY].forEach((b,i)=>{b.innerHTML=xs[i];b.style.display=xs[i]?'':'none'})}
/* touch: auto-aim at the nearest school in throw range until you touch the sea to aim yourself */
let aimAuto=false;
function autoAim(){aimAuto=false;if(!touch||G.net!==0||cn||tm-aimT<2.5)return;let b=1e9,s0=null;for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z);if(d<b&&d<34){b=d;s0=s}}if(!s0)return;
 const dx=s0.x+s0.vx-boat.position.x,dz=s0.z+s0.vz-boat.position.z,d=H(dx,dz)||1,m=cl(d,5,26);aim.set(boat.position.x+dx/d*m,0,boat.position.z+dz/d*m);aimAuto=true}
const tk=s=>touch?s.replace(/\\bF\\b/g,'ACT').replace(/\\bG\\b/g,'HAUL').replace(/\\(Q\\)/g,'(DEEPER)').replace(/\\(E\\)/g,'(SHALLOWER)').replace(/\\bJ\\b/g,'WAIT').replace(/\\bM\\b/g,'MESH'):s;
const coach0=coach;coach=function(){const r=coach0();if(aimAuto&&!chOn)r[0]+='  (auto-aim: touch the sea to aim yourself)';return[tk(r[0]),tk(r[1])]};
const tick2b=tick2;tick2=function(dt){tick2b(dt);ui3();
 if(tw){const vl=7.2-.12*tw.W+.3*lv('tough'),sp=Math.abs(boat.speed)*spdM();if(sp>vl*.97){drag=Math.max(drag,1-vl*.97/sp);if(!tw.gv){tw.gv=1;say('Tow limiter: this net tears above '+(vl*1.944).toFixed(0)+' kn, so your speed is capped')}}}};

/* ======== v4: boid schools (panic waves, bait balls, vortex milling, tail-wave fish), surface visibility, realistic nets ======== */
const PAL=[0xffe04a,0xff8a3d,0xff4d6d,0x7dff6a],UT={value:0},spA=new THREE.InstancedBufferAttribute(new Float32Array(4000).fill(1),1),phA=new THREE.InstancedBufferAttribute(new Float32Array(4000),1);
{const V=[],C=[],N=[0,0,.5],B1=[0,.14,.15],B2=[0,-.12,.15],Lf=[-.1,0,.15],Rg=[.1,0,.15],Pt=[0,.06,-.28],Pb=[0,-.06,-.28],Pl=[-.05,0,-.28],Pr=[.05,0,-.28],Tt=[0,.22,-.5],Tb=[0,-.22,-.5];
 [[N,B1,Rg],[N,Rg,B2],[N,B2,Lf],[N,Lf,B1],[B1,Pt,Pr],[B1,Pr,Rg],[Rg,Pr,Pb],[Rg,Pb,B2],[B2,Pb,Pl],[B2,Pl,Lf],[Lf,Pl,Pt],[Lf,Pt,B1],[Pt,Pb,Tb],[Pt,Tb,Tt]].forEach(t=>t.forEach(p=>{V.push(...p);const s=p[1]>.05?.55:p[1]<-.05?1.3:1;C.push(s,s,s)}));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(V,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('aPh',phA);g.setAttribute('aSp',spA);
 const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=UT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\\nattribute float aPh;attribute float aSp;uniform float uT;').replace('#include <begin_vertex>','vec3 transformed=vec3(position);float wv=sin(uT*9.0*aSp+aPh-position.z*7.0)*.09*smoothstep(.25,-.5,position.z)*(.4+.6*aSp);transformed.x+=wv;')};
 fm.geometry=g;fm.material=m}
dm.rotation.order='YXZ';
{const c=new THREE.Color();fish.forEach((f,i)=>{f.ph=R()*TAU;fm.setColorAt(i,c.set(PAL[SP.indexOf(f.sp)]).multiplyScalar(1.0));phA.array[i]=f.ph;f.pn=0;f.rd=R()*TAU;f.vy=0});fm.instanceColor.needsUpdate=true;phA.needsUpdate=true}
for(const s of schools){s.rad=Math.sqrt(s.n)*.65+2;s.lx=s.x;s.lz=s.z;s.ta=s.a;s.tt=rt(2,6);s.ph=R()*TAU;s.fmd=0;s.ft=rt(6,14);const cr=s.sp.sw*.6;for(const f of s.f){const r=s.rad*Math.sqrt(R()),a=R()*TAU;f.x=f.px=s.x+Math.cos(a)*r;f.z=f.pz=s.z+Math.sin(a)*r;f.y=-s.d+(R()-.5)*2.4;f.vx=Math.cos(s.a)*cr;f.vz=Math.sin(s.a)*cr}}
const respawn0=respawn;respawn=function(s){respawn0(s);s.lx=s.x;s.lz=s.z;s.ta=s.a;for(const f of s.f)if(f.st===0){f.vx=Math.cos(s.a)*s.sp.sw*.6;f.vz=Math.sin(s.a)*s.sp.sw*.6;f.vy=0;f.pn=0}};
const AD=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const pDist=(px,pz,s)=>{const dx=s[2]-s[0],dz=s[3]-s[1],t=cl(((px-s[0])*dx+(pz-s[1])*dz)/(dx*dx+dz*dz||1),0,1),qx=s[0]+dx*t-px,qz=s[1]+dz*t-pz;return[H(qx,qz),qx,qz]};

/* boids: separation/alignment/cohesion (sampled neighbours), panic that spreads fish-to-fish, vortex milling, bait ball, boat + net avoidance */
fishStep=function(dt){
 const bx=boat.position.x,bz=boat.position.z,ns=(.1+Math.pow(Math.abs(vEff)/8,1.2))*(1-.15*lv('stealth'));UT.value=tm;
 if(ps&&!ps.cr&&ps.A)ps.cr=Math.sqrt(ps.A/Math.PI);
 for(const s of schools){const d=H(s.x-bx,s.z-bz);if(d>400){respawn(s);continue}
  if((s.tt-=dt)<=0){s.tt=rt(4,12);s.ta=s.a+rt(-1.4,1.4)}
  if((s.ft-=dt)<=0){s.ft=rt(7,16);s.fmd=[0,0,1,1,2][R()*5|0]}
  if(s.al>.45)s.fmd=2;
  if(s.fl>0){s.fl-=dt;s.d=Math.min(s.d+dt,13)}else s.d+=(s.d0+Math.sin(tm*.07+s.ph)*1.2-s.d)*dt*.1;
  s.a+=cl(AD(s.ta,s.a),-1,1)*dt*(s.fl>0?.9:.3);
  const cr=s.sp.sw*.6*(s.fl>0?3.2:s.fmd===1?.3:1);s.vx=Math.cos(s.a)*cr;s.vz=Math.sin(s.a)*cr;s.lx+=s.vx*dt;s.lz+=s.vz*dt;
  let cx=0,cz=0,n=0;for(const f of s.f)if(f.st===0){cx+=f.x;cz+=f.z;n++}
  if(n>3){s.x=cx/n;s.z=cz/n;if(s.fl<=0){s.lx+=(s.x-s.lx)*dt*.3;s.lz+=(s.z-s.lz)*dt*.3}}else{s.x=s.lx;s.z=s.lz}
  const rad=55+25*s.sp.k,noise=(.04+Math.pow(Math.abs(vEff)/8,1.6))*(1-.15*lv('stealth'))*(ps&&ps.st==='set'?1.5:1)*(tw?.8:1)*cl(1.15-s.d/14,.3,1);
  if(d<rad)s.al+=noise*s.sp.k*(1-d/rad)*dt*.45;s.al=Math.max(0,s.al-.12*dt);
  if(s.al>=1&&s.fl<=0){s.fl=9;s.al=0;s.a=s.ta=Math.atan2(s.z-bz,s.x-bx);s.lx=s.x;s.lz=s.z;if(d<90)say(s.sp.n+' school spooked - slow down near them!')}}
 let gx=0,gz=0,gap=false;if(ps&&ps.st==='set'&&ps.pts.length>2){let mx=0,mz=0;for(const q of ps.pts){mx+=q.x;mz+=q.z}mx/=ps.pts.length;mz/=ps.pts.length;const c=ps.gs||{x:mx,z:mz};gx=c.x+(c.x-mx)*3;gz=c.z+(c.z-mz)*3;gap=true}
 let k=0;
 for(const f of fish){const s=f.s,sp=f.sp;
  if(f.st===2&&!ps){f.st=0;f.own=null}
  if(f.st===0||f.st===2){f.px=f.x;f.pz=f.z;
   const en=f.st===2,cr=sp.sw*.6,L=sp.len*3.2;let ax=0,ay=0,az=0,fast=0;
   f.pn=Math.max(0,f.pn-dt*.5);
   if(f.dl>0){f.dl-=dt;if(f.dl<=0)f.fl=4}
   if(f.fl>0){f.fl-=dt;f.pn=1}else if(s.fl>0&&!en)f.pn=Math.max(f.pn,.7);
   if((f.rt=(f.rt||0)-dt)<=0){f.rt=rt(.4,1.1);f.rd=R()*TAU}
   if(f.fl>0){fast=1;const fs=sp.sw*(f.fsp||2.4);ax=(f.fx*fs-f.vx)*4;az=(f.fz*fs-f.vz)*4}
   else{const m=s.f.length;let nc=0,px=0,py=0,pz=0,vx=0,vy=0,vz=0;
    for(let j=0;j<6;j++){const o=s.f[R()*m|0];if(o===f||o.st!==f.st)continue;const dx=f.x-o.x,dy=f.y-o.y,dz=f.z-o.z,d2=dx*dx+dy*dy+dz*dz+1e-4;if(d2>225)continue;
     nc++;px+=o.x;py+=o.y;pz+=o.z;vx+=o.vx;vy+=o.vy;vz+=o.vz;if(o.pn>.35&&d2<36)f.pn=Math.max(f.pn,o.pn*.95);
     if(d2<L*L*5){const dd=Math.sqrt(d2),q=(L*2.2/dd-1)*3;ax+=dx/dd*q;ay+=dy/dd*q;az+=dz/dd*q}}
    const co=(.18+1.2*s.al)*(en?.6:1);
    if(nc){ax+=(px/nc-f.x)*co+(vx/nc-f.vx)*1.2;ay+=(py/nc-f.y)*co*.5;az+=(pz/nc-f.z)*co+(vz/nc-f.vz)*1.2}
    if(en){const rx=f.x-ps.cx,rz=f.z-ps.cz,rd=H(rx,rz)||1,tr=.45*(ps.cr||8)*(1-.9*(ps.tp||0));ax+=-rz/rd*cr*.8-rx/rd*(rd-tr)*.5;az+=rx/rd*cr*.8-rz/rd*(rd-tr)*.5}
    else{const dx=s.lx-f.x,dz=s.lz-f.z,d=H(dx,dz)||1,pu=cl(d/s.rad-.6,0,4)*1.6;ax+=dx/d*pu+(s.vx-f.vx)*.5;az+=dz/d*pu+(s.vz-f.vz)*.5;
     if(s.fmd===1){const rx=f.x-s.x,rz=f.z-s.z,rd=H(rx,rz)||1,tr=s.rad*.55;ax+=-rz/rd*cr*.9-rx/rd*(rd-tr)*.6;az+=rx/rd*cr*.9-rz/rd*(rd-tr)*.6;ay+=Math.sin(tm*.8+f.ph)*.3}
     else if(s.fmd===2){ax+=(s.x-f.x)*.5;az+=(s.z-f.z)*.5}}
    const db=H(f.x-bx,f.z-bz);if(db<16){const w=(1-db/16)*cl(1.1+f.y/14,.25,1),q=w*w*18*ns/(db||1);ax+=(f.x-bx)*q;az+=(f.z-bz)*q;ay-=w*2*ns;f.pn=Math.max(f.pn,w*ns*1.6)}
    if(f.pn>.15){ax+=Math.cos(f.rd)*f.pn*9;az+=Math.sin(f.rd)*f.pn*9}if(gap&&f.pn>.4&&!en){const dx=gx-f.x,dz=gz-f.z,d=H(dx,dz)||1;ax+=dx/d*f.pn*5;az+=dz/d*f.pn*5;ay-=f.pn*1.2}
    if(f.pn>.5||(s.fl>0&&!en))fast=1;
    if(ps&&ps.st!=='done'&&ps.sg.length&&Math.abs(f.x-ps.bx)<150&&Math.abs(f.z-ps.bz)<150)for(const sg of ps.sg){if(-f.y>=wd(ps,sg[4]))continue;const q=pDist(f.x,f.z,sg);if(q[0]<3){const w=(1-q[0]/3)*7/(q[0]||1);ax-=q[1]*w;az-=q[2]*w}}
    const ty=cl(en?-(ps.D*.7):-(s.d+f.oy)-(fast?3:0),FL+.6,-.7);ay+=(ty-f.y)*.7-f.vy*1.4;
    const cs=Math.hypot(f.vx,f.vz)||.01,tg=cr*(fast?2.6:1)*(en?.8:1);ax+=f.vx/cs*(tg-cs)*.9;az+=f.vz/cs*(tg-cs)*.9}
   f.vx+=ax*dt;f.vz+=az*dt;f.vy+=ay*dt;const hs=Math.hypot(f.vx,f.vz),mx=cr*(fast?4.2:1.6);if(hs>mx){f.vx*=mx/hs;f.vz*=mx/hs}f.vy=cl(f.vy,-1.6,1.6);
   f.x+=f.vx*dt;f.z+=f.vz*dt;f.y=cl(f.y+f.vy*dt,FL+.6,-.7);
   if(ps&&ps.st!=='done'&&ps.sg.length)wallPass(f);
   if(en&&ps.st!=='purse'&&!inPoly(f.x,f.z,ps.pts)){f.st=0;f.own=null;f.fl=10;const a=Math.atan2(f.z-ps.cz,f.x-ps.cx);f.fx=Math.cos(a);f.fz=Math.sin(a)}
   if(en&&ps&&ps.st==='purse'){const q=(inPoly(f.x,f.z,ps.pts)?.2:2)*dt*.8;f.x+=(ps.cx-f.x)*q;f.z+=(ps.cz-f.z)*q}
  }else if(f.st===1){const o=f.own;
   if(o===cn&&cn){const c0=cn.P[0],m=Math.max(.4,cn.rr*.8),d=H(f.cx,f.cz);if(d>m){f.cx*=m/d;f.cz*=m/d}f.cy=cl(f.cy-dt*.3,cn.ry+.2,c0.y-.2);f.x=c0.x+f.cx;f.z=c0.z+f.cz;f.y=f.cy}
   else if(o===tw&&tw){const c=tw.cd;f.x=c.x+f.cx;f.y=c.y+f.cy;f.z=c.z+f.cz}
   else f.st=3}
  if(f.st===3)dm.scale.set(0,0,0);else{const hs=Math.hypot(f.vx,f.vz);dm.position.set(f.x,f.y,f.z);dm.rotation.set(Math.atan2(-f.vy,hs||1)*.8,f.st===1?Math.sin(tm*7+f.ph)*1.2:Math.atan2(f.vx,f.vz),0);dm.scale.setScalar(H(f.x-bx,f.z-bz)<3.6?0:sp.len*4.5);spA.array[k]=f.st===1?2.5:cl(Math.hypot(hs,f.vy)/(sp.sw*.6),.5,3)}
  dm.updateMatrix();fm.setMatrixAt(k++,dm.matrix)}
 fm.instanceMatrix.needsUpdate=true;spA.needsUpdate=true};

/* ---------- see schools from above: surface shadow, boil ripples, floating tags ---------- */
const gt=f=>{const c=document.createElement('canvas');c.width=c.height=64;f(c.getContext('2d'));return new THREE.CanvasTexture(c)};
const tSh=gt(g=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(0,28,44,.95)');r.addColorStop(.55,'rgba(0,28,44,.5)');r.addColorStop(1,'rgba(0,28,44,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}),
tRg=gt(g=>{g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=3;g.beginPath();g.arc(32,32,27,0,TAU);g.stroke()}),
pg=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),dMat=t=>new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false});
for(const s of schools){s.dc=new THREE.Mesh(pg,dMat(tSh));s.rp=new THREE.Mesh(pg,dMat(tRg));for(const m of[s.dc,s.rp]){m.renderOrder=998;m.frustumCulled=false;scene.add(m)}}
const stg=[0,1,2,3,4].map(()=>{const e=document.createElement('div');e.style.cssText='position:fixed;pointer-events:none;transform:translate(-50%,-100%);font:700 10px system-ui;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;z-index:3;display:none';document.body.append(e);return e});
function schoolFx(){const y=S.S.y*.7+.3,L=[];
 for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z),on=d<420;s.dc.visible=on;if(!on){s.rp.visible=false;continue}L.push([d,s]);
  s.dc.position.set(s.x,y,s.z);s.dc.scale.setScalar(s.rad*2.6);s.dc.material.opacity=cl(.75*(1-s.d/14),.1,.75)*cl((d-6)/10,.35,1);
  const act=s.d<5||s.fl>0||s.al>.3,ph=(tm*.7+s.ph)%1;s.rp.visible=act;if(act){s.rp.position.set(s.x,y,s.z);s.rp.scale.setScalar(s.rad*(1+1.4*ph)*(s.fl>0?1.6:1));s.rp.material.opacity=.6*(1-ph)}}
 L.sort((a,b)=>a[0]-b[0]);stg.forEach((e,i)=>{const a=L[i];if(!a||a[0]>260){e.style.display='none';return}const s=a[1];v3.set(s.x,1.5,s.z).project(cam);if(v3.z>1){e.style.display='none';return}
  e.style.display='block';e.style.left=(v3.x+1)/2*innerWidth+'px';e.style.top=(1-v3.y)/2*innerHeight+'px';e.textContent='🐟 '+s.sp.n+' ×'+s.f.filter(f=>f.st===0).length+' · '+s.d.toFixed(0)+'m'+(s.fl>0?' ⚠':'')})}

/* ---------- realistic nets: diamond-mesh panels, cork floats, lead weights, otter boards ---------- */
const nt=gt(g=>{g.strokeStyle='#fff';g.lineWidth=5;g.beginPath();g.moveTo(0,32);g.lineTo(32,0);g.lineTo(64,32);g.lineTo(32,64);g.closePath();g.stroke()});nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.generateMipmaps=false;nt.minFilter=THREE.LinearFilter;
const nMat=c=>fadeMat(new THREE.MeshBasicMaterial({map:nt,alphaTest:.35,side:THREE.DoubleSide,color:c})),vis=new Map(),o3=new THREE.Object3D();
const mkMesh=(g,c)=>{const m=new THREE.Mesh(g,nMat(c));m.frustumCulled=false;m.renderOrder=4;scene.add(m);return m};
const inst=(geo,max,cols)=>{const m=new THREE.InstancedMesh(geo,fadeMat(new THREE.MeshBasicMaterial()),max);m.frustumCulled=false;m.renderOrder=4;m.count=0;for(let i=0;i<max;i++)m.setColorAt(i,new THREE.Color(cols[i%cols.length]));scene.add(m);return m};
const visOf=(key,mk)=>{let v=vis.get(key);if(!v){v=mk();vis.set(key,v)}return v};
function visSweep(){for(const[k,v]of vis)if(!(k===ps||k===cn||k===tw||gl.includes(k))){for(const o of v.objs){scene.remove(o);o.geometry.dispose()}vis.delete(k)}}
function strip(nc){const g=new THREE.BufferGeometry(),I=[];for(let i=0;i<nc-1;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nc*6),3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(nc*4),2));g.setIndex(I);g.setDrawRange(0,0);return mkMesh(g,0xf1e7c6)}
function fillStrip(m,cols,cell){const g=m.geometry,P=g.attributes.position.array,U=g.attributes.uv.array;let u=0,n=0;for(let i=0;i<cols.length&&i<P.length/6;i++){const c=cols[i];if(i)u+=H(c[0]-cols[i-1][0],c[2]-cols[i-1][2])/cell;P.set(c,i*6);U.set([u,0,u,H(c[1]-c[4],H(c[0]-c[3],c[2]-c[5]))/cell],i*4);n=i+1}g.setDrawRange(0,Math.max(0,n-1)*6);g.attributes.position.needsUpdate=g.attributes.uv.needsUpdate=true}
function line(m,pts,sp,yf,s0=1){let acc=0,n=0;const mx=m.instanceMatrix.count;for(let i=0;i<pts.length-1&&n<mx;i++){const a=pts[i],b=pts[i+1],l=H(b[0]-a[0],b[2]-a[2]);if(!l)continue;let u=acc;while(u<l&&n<mx){const t=u/l;o3.position.set(a[0]+(b[0]-a[0])*t,yf(a,b,t,n),a[2]+(b[2]-a[2])*t);o3.scale.setScalar(s0);o3.updateMatrix();m.setMatrixAt(n++,o3.matrix);u+=sp}acc=u-l}m.count=n;m.instanceMatrix.needsUpdate=true}
function drawWall(key,cols,sf,sw){const v=visOf(key,()=>{const w=strip(260),fl=inst(new THREE.SphereGeometry(.2,8,6),260,[0xff6a1a,0xf4f4f4]),wt=inst(new THREE.BoxGeometry(.16,.28,.16),200,[0x2a2a2a]);return{objs:[w,fl,wt],w,fl,wt}});
 fillStrip(v.w,cols,.9);line(v.fl,cols.map(c=>[c[0],c[1],c[2]]),sf,(a,b,t,n)=>.12+Math.sin(tm*1.6+n)*.05);line(v.wt,cols.map(c=>[c[3],c[4],c[5]]),sw,(a,b,t)=>a[1]+(b[1]-a[1])*t)}
function drawSeine(p){const P=p.pts.map(q=>[q.x,q.z,q.t]);if(p.st==='set'){const[sx,sz]=stern(3.4);P.push([sx,sz,P[P.length-1][2]])}const tp=p.st==='purse'?cl(p.tp,0,1):0;
 drawWall(p,P.map(q=>[q[0],.12,q[1],p.cx+(q[0]-p.cx)*(1-.8*tp),-wd(p,q[2])*(1-.5*tp),p.cz+(q[1]-p.cz)*(1-.8*tp)]),2.2,3)}
const drawGill=n=>drawWall(n,n.pts.map(p=>[p.x,.12,p.z,p.x,-n.D,p.z]),3,4);
function drawCast(n){const N=16,RG=4,ix=(r,i)=>1+(r-1)*(N+1)+i,v=visOf(n,()=>{const g=new THREE.BufferGeometry(),V=1+RG*(N+1),I=[],U=new Float32Array(V*2);
  for(let i=0;i<N;i++)I.push(0,ix(1,i),ix(1,i+1));for(let r=2;r<=RG;r++)for(let i=0;i<N;i++){const a=ix(r-1,i),b=ix(r-1,i+1),c=ix(r,i),d=ix(r,i+1);I.push(a,c,b,b,c,d)}
  for(let r=1;r<=RG;r++)for(let i=0;i<=N;i++){const q=ix(r,i);U[q*2]=n.Rn*r/RG/.6;U[q*2+1]=TAU*n.Rn*r/RG/.6*i/N}
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(V*3),3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(I);const m=mkMesh(g,0xf1e7c6),wt=inst(new THREE.SphereGeometry(.11,8,6),16,[0x2a2a2a]);wt.count=16;return{objs:[m,wt],m,wt}});
 const P=n.P,pos=v.m.geometry.attributes.position.array;pos.set([P[0].x,P[0].y,P[0].z],0);for(let r=1;r<=RG;r++)for(let i=0;i<=N;i++){const p=P[1+(r-1)*N+i%N];pos.set([p.x,p.y,p.z],ix(r,i)*3)}v.m.geometry.attributes.position.needsUpdate=true;
 for(let i=0;i<16;i++){const p=P[49+i];o3.position.set(p.x,p.y,p.z);o3.scale.setScalar(1+n.Rn*.08);o3.updateMatrix();v.wt.setMatrixAt(i,o3.matrix)}v.wt.instanceMatrix.needsUpdate=true}
function drawTrawl(T){if(!T.rs)return;const v=visOf(T,()=>{const g=new THREE.BufferGeometry(),I=[],U=new Float32Array(74),ix=(k,i)=>k*9+i,cl2=.7,Lb=T.W*.75,cir=2.36*T.W;
  for(let k=0;k<3;k++)for(let i=0;i<8;i++){const a=ix(k,i),b=ix(k,i+1),c=ix(k+1,i),d=ix(k+1,i+1);I.push(a,c,b,b,c,d)}for(let i=0;i<8;i++)I.push(ix(3,i),36,ix(3,i+1));
  for(let k=0;k<4;k++)for(let i=0;i<=8;i++){U[ix(k,i)*2]=k*Lb/cl2;U[ix(k,i)*2+1]=i/8*cir/cl2}U[72]=4*Lb/cl2;
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(111),3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(I);
  const m=mkMesh(g,0xe9dfc0),fl=inst(new THREE.SphereGeometry(.22,8,6),24,[0xff6a1a,0xf4f4f4]),wt=inst(new THREE.SphereGeometry(.16,8,6),24,[0x2a2a2a]),bd=[0,1].map(()=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.12,1.1,1.5),fadeMat(new THREE.MeshBasicMaterial({color:0x7a5a2e})));b.frustumCulled=false;b.renderOrder=4;scene.add(b);return b});
  return{objs:[m,fl,wt,...bd],m,fl,wt,bd}});
 const pos=v.m.geometry.attributes.position.array;for(let k=0;k<4;k++)for(let i=0;i<=8;i++)pos.set(T.rs[k][i%8],(k*9+i)*3);pos.set([T.cd.x,T.cd.y,T.cd.z],108);v.m.geometry.attributes.position.needsUpdate=true;
 const r=T.rs[0],sc=.8+T.W*.03,yl=(a,b,t)=>a[1]+(b[1]-a[1])*t;line(v.fl,[r[0],r[1],r[2],r[3],r[4]],T.W/5,yl,sc);line(v.wt,[r[4],r[5],r[6],r[7],r[0]],T.W/6,yl,sc);
 v.bd.forEach((b,j)=>{const p=T.bd&&T.bd[j];b.visible=!!p;if(p){b.position.set(p[0],p[1],p[2]);b.lookAt(T.mc.x,T.mc.y,T.mc.z)}})}
const tick2d=tick2;tick2=function(dt){tick2d(dt);schoolFx();if(cn)drawCast(cn);if(tw)drawTrawl(tw);if(ps)drawSeine(ps);gl.forEach(drawGill);visSweep()};

/* ======== v5: fish + nets drawn AFTER the water (visible through foam), depth fade, radar arrows, schools respawn ahead, easier first catch ======== */
const fadeSh=(sh,pre='')=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\\nvarying float vFade;'+(pre?'\\nattribute float aPh;attribute float aSp;uniform float uT;':'')).replace('#include <begin_vertex>','#include <begin_vertex>\\n'+pre+'\\nvec4 wp=vec4(transformed,1.0);\\n#ifdef USE_INSTANCING\\nwp=instanceMatrix*wp;\\n#endif\\nwp=modelMatrix*wp;vFade=clamp(1.15+wp.y*.075,.3,1.);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\\nvarying float vFade;').replace('#include <color_fragment>','#include <color_fragment>\\ndiffuseColor.rgb=mix(vec3(.04,.28,.42),diffuseColor.rgb,vFade);diffuseColor.a*=mix(.35,1.,vFade);')};
function fadeMat(m){m.transparent=true;m.depthWrite=false;m.depthTest=false;m.onBeforeCompile=sh=>fadeSh(sh);return m}
{const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,depthWrite:false,depthTest:false});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=UT;fadeSh(sh,'float wv=sin(uT*9.0*aSp+aPh-position.z*7.0)*.09*(1.0-smoothstep(-.5,.25,position.z))*(.4+.6*aSp);transformed.x+=wv;')};
 fm.material=m;fm.renderOrder=4}
{const s=schools[0];s.d0=s.d=1.8;s.f.forEach(f=>{f.oy*=.4;f.y=-1.8+(R()-.5)})}
respawn=function(s){const fx=-Math.sin(boat.heading),fz=-Math.cos(boat.heading),a=Math.atan2(fz,fx)+rt(-1.3,1.3),d=rt(150,290),cr=s.sp.sw*.6;
 s.x=s.lx=boat.position.x+Math.cos(a)*d;s.z=s.lz=boat.position.z+Math.sin(a)*d;s.al=s.fl=0;s.d=s.d0;s.a=s.ta=R()*TAU;
 for(const f of s.f)if(f.st===0||f.st===3){f.st=0;const r=s.rad*Math.sqrt(R()),b=R()*TAU;f.x=f.px=s.x+Math.cos(b)*r;f.z=f.pz=s.z+Math.sin(b)*r;f.y=-s.d+(R()-.5)*2;f.fl=0;f.dl=0;f.vx=Math.cos(s.a)*cr;f.vz=Math.sin(s.a)*cr;f.vy=0;f.pn=0}};
const sonar1=sonar;sonar=function(){sonar1();const Rg=150+50*lv('sonar'),k=70/Rg,h=boat.heading,bx=boat.position.x,bz=boat.position.z,pr=(x,z)=>{const dx=x-bx,dz=z-bz;return[75+(dx*Math.cos(h)-dz*Math.sin(h))*k,75-(-dx*Math.sin(h)-dz*Math.cos(h))*k]};
 if(cn){const p=pr(cn.P[0].x,cn.P[0].z);sx.strokeStyle='#ffd24a';sx.beginPath();sx.arc(p[0],p[1],Math.max(3,cn.Rn*k),0,TAU);sx.stroke()}
 if(G.net===0&&!cn){const p=pr(aim.x,aim.z);sx.strokeStyle='#6f9';sx.beginPath();sx.arc(p[0],p[1],3,0,TAU);sx.moveTo(p[0]-6,p[1]);sx.lineTo(p[0]+6,p[1]);sx.moveTo(p[0],p[1]-6);sx.lineTo(p[0],p[1]+6);sx.stroke()}
 const L=schools.map(s=>[H(s.x-bx,s.z-bz),s]).filter(a=>a[0]>Rg*.97).sort((a,b)=>a[0]-b[0]).slice(0,3);sx.font='9px monospace';
 for(const[d,s]of L){const p=pr(s.x,s.z),an=Math.atan2(p[1]-75,p[0]-75),x=75+Math.cos(an)*64,y=75+Math.sin(an)*64;sx.fillStyle='#'+s.sp.c.toString(16).padStart(6,'0');sx.beginPath();sx.moveTo(x+Math.cos(an)*6,y+Math.sin(an)*6);sx.lineTo(x+Math.cos(an+2.4)*5,y+Math.sin(an+2.4)*5);sx.lineTo(x+Math.cos(an-2.4)*5,y+Math.sin(an-2.4)*5);sx.fill();
  sx.fillStyle='#fff';sx.fillText(d.toFixed(0),x-Math.cos(an)*16-8,y-Math.sin(an)*16+3)}};
const coach1=coach;coach=function(){const r=coach1();if(!tgt()){let b=1e9,n=null;for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z);if(d<b){b=d;n=s}}
 if(n){const h=boat.heading,dx=n.x-boat.position.x,dz=n.z-boat.position.z,a=Math.atan2(dx*Math.cos(h)-dz*Math.sin(h),-dx*Math.sin(h)-dz*Math.cos(h));r[1]=r[1].replace(/No school within[^\\n]*/,'Nearest school: '+n.sp.n+' ×'+n.f.filter(f=>f.st===0).length+' · '+b.toFixed(0)+' m '+'↑↗→↘↓↙←↖'[Math.round(a/(Math.PI/4)+8)%8]+' · depth '+n.d.toFixed(0)+' m')}}return r};

/* ======== v7: dense 3D schools (spatial-hash boids, vortex bait balls), loud boats, bait, birds, silent radar ======== */
Object.assign(G,{bait:12});
const HT=16384,head=new Int32Array(HT),nxt=new Int32Array(4096),GS=2.2,hsh=(a,b,c)=>((a*73856093)^(b*19349663)^(c*83492791))&(HT-1),baits=[],ob=new THREE.Object3D();
for(const s of schools){const n=s.f.length;s.rad=1.5*Math.cbrt(n)+1;s.thick=Math.min(6,s.rad*.9);const cr=s.sp.sw*.6;
 for(const f of s.f){const r=s.rad*.5*Math.cbrt(R()),a=R()*TAU;f.oy=(R()-.5)*s.thick;f.x=f.px=s.x+Math.cos(a)*r;f.z=f.pz=s.z+Math.sin(a)*r;f.y=cl(-s.d+f.oy,FL+.6,-.5);f.vx=Math.cos(s.a)*cr;f.vz=Math.sin(s.a)*cr;f.vy=0;f.nax=f.nay=f.naz=0}}
respawn=function(s){const fx=-Math.sin(boat.heading),fz=-Math.cos(boat.heading),a=Math.atan2(fz,fx)+rt(-1.3,1.3),d=rt(150,290),cr=s.sp.sw*.6;
 s.x=s.lx=boat.position.x+Math.cos(a)*d;s.z=s.lz=boat.position.z+Math.sin(a)*d;s.al=s.fl=0;s.d=s.d0;s.a=s.ta=R()*TAU;
 for(const f of s.f)if(f.st===0||f.st===3){f.st=0;const r=s.rad*.5*Math.cbrt(R()),b=R()*TAU;f.x=f.px=s.x+Math.cos(b)*r;f.z=f.pz=s.z+Math.sin(b)*r;f.y=cl(-s.d+f.oy,FL+.6,-.5);f.fl=0;f.dl=0;f.vx=Math.cos(s.a)*cr;f.vz=Math.sin(s.a)*cr;f.vy=0;f.pn=0}};
land=function(list){const by={},m=1+.06*Math.min(G.streak,10);let v=0;for(const f of list){f.st=3;f.own=null;G.hb[SP.indexOf(f.sp)]++;v+=f.sp.v*m;by[f.sp.n]=(by[f.sp.n]||0)+1}G.hold+=list.length;G.val+=v;beep(660,.1);return list.length+' fish ('+Object.entries(by).map(e=>e[1]+' '+e[0]).join(', ')+') +$'+Math.round(v)};

/* ---- boids with a spatial hash: true local neighbours, panic waves, vortex milling (the donut bait ball), bait frenzy, loud boats ---- */
let fcount=0;
fishStep=function(dt0){const dt=dt0;fcount++;
 const bx=boat.position.x,bz=boat.position.z,eng=Math.abs(boat.speed)*spdM(),stl=1-.15*lv('stealth'),ns=(.25+Math.pow(eng/8,1.1)*2.2)*stl*(tw?.9:1)*(ps&&ps.st==='set'?.5:1),rA=26+46*Math.min(1,eng/6),rb=(14+22*Math.min(1,eng/6))*(ps&&ps.st==='set'?.6:1),deep=Math.max(0,Math.cos((S.P.hour-13)*Math.PI/12));
 UT.value=tm;if(ps&&!ps.cr&&ps.A)ps.cr=Math.sqrt(ps.A/Math.PI);
 for(let i=baits.length-1;i>=0;i--){baits[i].t+=dt;if(baits[i].t>baits[i].life)baits.splice(i,1)}
 for(const s of schools){const d=H(s.x-bx,s.z-bz);s.dd=d;if(d>420){respawn(s);continue}
  let bt=null,bd=1e9;for(const b of baits){const q=H(b.x-s.x,b.z-s.z);if(q<bd&&q<170){bd=q;bt=b}}
  s.bt=bt;s.fd=bt&&bd<30?1:0;
  if((s.tt-=dt)<=0){s.tt=rt(4,12);s.ta=s.a+rt(-1.4,1.4)}
  if((s.ft-=dt)<=0){s.ft=rt(7,16);s.fmd=[0,0,1,1,2][R()*5|0]}
  if(bt&&s.fl<=0){s.ta=Math.atan2(bt.z-s.z,bt.x-s.x);if(bd<24)s.fmd=1}
  if(s.al>.45&&!s.fd)s.fmd=2;
  if(s.fl>0){s.fl-=dt;s.d=Math.min(s.d+dt,13)}else s.d+=((s.fd?1.4:s.d0+Math.sin(tm*.07+s.ph)*1.2+2.2*deep)-s.d)*dt*.1;
  s.a+=cl(AD(s.ta,s.a),-1,1)*dt*(s.fl>0?.9:.3);
  const cr=s.sp.sw*.6*(s.fl>0?3.2:s.fmd===1?.3:1)*(bt&&!s.fd?1.5:1)*s.spm;s.vx=Math.cos(s.a)*cr;s.vz=Math.sin(s.a)*cr;s.lx+=s.vx*dt;s.lz+=s.vz*dt;
  let cx=0,cz=0,n=0;for(const f of s.f)if(f.st===0){cx+=f.x;cz+=f.z;n++}
  if(n>3){s.x=cx/n;s.z=cz/n;if(s.fl<=0){s.lx+=(s.x-s.lx)*dt*.3;s.lz+=(s.z-s.lz)*dt*.3}}else{s.x=s.lx;s.z=s.lz}
  if(d<rA)s.al+=ns*s.sp.k*s.sk*(1-d/rA)*dt*.55*cl(1.15-s.d/14,.3,1)*(s.fd?(eng<2.2?.15:.5):1)*(ps&&ps.st==='set'?1.4:1);s.al=Math.max(0,s.al-.12*dt);
  if(ps&&ps.st==='set'&&ps.gs===s)s.al=Math.min(s.al,.9);
  if(s.al>=1&&s.fl<=0){s.fl=9;s.al=0;s.a=s.ta=Math.atan2(s.z-bz,s.x-bx);s.lx=s.x;s.lz=s.z}}
 head.fill(-1);const NF=fish.length,off=(R()*NF)|0,fr=(tm*60|0)&1;
 for(let j=0;j<NF;j++){const i=(j+off)%NF,f=fish[i];if(f.st===0||f.st===2){const h=hsh(Math.floor(f.x/GS),Math.floor(f.y/GS),Math.floor(f.z/GS));nxt[i]=head[h];head[h]=i}}
 let gx=0,gz=0,gmx=0,gmz=0,gap=false;if(ps&&ps.st==='set'&&ps.pts.length>2){const[sx2,sz2]=stern(3.4),c=ps.gs||{x:ps.bx,z:ps.bz};gmx=(sx2+ps.bx)/2;gmz=(sz2+ps.bz)/2;gx=gmx+(gmx-c.x)*.6;gz=gmz+(gmz-c.z)*.6;gap=true}
 for(let k=0;k<NF;k++){const f=fish[k],s=f.s,sp=f.sp,far=s.dd>260;if(far&&((k+fcount)&3)!==0)continue;const dt=far?Math.min(dt0*4,.12):dt0;
  if(f.st===2&&!ps){f.st=0;f.own=null}
  if(f.st===0||f.st===2){f.px=f.x;f.pz=f.z;
   const en=f.st===2,cr=sp.sw*.6*s.spm,L=sp.vl*.72*s.sz;let ax=0,ay=0,az=0,fast=0,spd=1;
   f.pn=Math.max(0,f.pn-dt*.5);
   if(f.dl>0){f.dl-=dt;if(f.dl<=0)f.fl=4}
   if(f.fl>0){f.fl-=dt;f.pn=1}else if(s.fl>0&&!en)f.pn=Math.max(f.pn,.7);
   if((f.rt=(f.rt||0)-dt)<=0){f.rt=rt(.4,1.1);f.rd=R()*TAU}
   if(f.fl>0){fast=1;const fs=sp.sw*(f.fsp||2.4);ax=(f.fx*fs-f.vx)*4;az=(f.fz*fs-f.vz)*4}
   else{
    if((k&1)===fr){let nc=0,ck=0,px=0,py=0,pz=0,vx=0,vy=0,vz=0,sx_=0,sy_=0,sz_=0;const ix=Math.floor(f.x/GS),iy=Math.floor(f.y/GS),iz=Math.floor(f.z/GS),sr=L*1.6,sr2=sr*sr;
     out:for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)for(let j=head[hsh(ix+a,iy+b,iz+c)];j>=0;j=nxt[j]){const o=fish[j];if(o===f||o.s!==s||o.st!==f.st)continue;if(++ck>70)break out;const dx=f.x-o.x,dy=f.y-o.y,dz=f.z-o.z,d2=dx*dx+dy*dy+dz*dz+1e-4;
      if(d2<sr2){const dd=Math.sqrt(d2),q=(sr/dd-1)*3;sx_+=dx/dd*q;sy_+=dy/dd*q;sz_+=dz/dd*q}
      if(d2<25&&nc<12){nc++;px+=o.x;py+=o.y;pz+=o.z;vx+=o.vx;vy+=o.vy;vz+=o.vz;if(o.pn>.35&&d2<16)f.pn=Math.max(f.pn,o.pn*.95)}}
     const co=(.3+1.2*s.al)*(en?.6:1);
     f.nax=sx_+(nc?(px/nc-f.x)*co+(vx/nc-f.vx)*1.8:0);f.nay=sy_*.8+(nc?(py/nc-f.y)*co*.6:0);f.naz=sz_+(nc?(pz/nc-f.z)*co+(vz/nc-f.vz)*1.8:0)}
    ax+=f.nax;ay+=f.nay;az+=f.naz;
    if(en){const rx=f.x-ps.cx,rz=f.z-ps.cz,rd=H(rx,rz)||1,tr=.45*(ps.cr||8)*(1-.9*(ps.tp||0));ax+=-rz/rd*cr*.8-rx/rd*(rd-tr)*.5;az+=rx/rd*cr*.8-rz/rd*(rd-tr)*.5}
    else{const dx=s.lx-f.x,dz=s.lz-f.z,d=H(dx,dz)||1,pu=cl(d/s.rad-.6,0,4)*1.6;ax+=dx/d*pu+(s.vx-f.vx)*.5;az+=dz/d*pu+(s.vz-f.vz)*.5;
     const fd=s.fd&&s.bt;
     if(s.fmd===1||fd){const cx0=fd?s.bt.x:s.x,cz0=fd?s.bt.z:s.z,rx=f.x-cx0,rz=f.z-cz0,rd=H(rx,rz)||1,tr=fd?3.5+f.oy*.25+s.rad*.12:s.rad*.5;
      ax+=-rz/rd*cr*1.8-rx/rd*(rd-tr)*1.1;az+=rx/rd*cr*1.8-rz/rd*(rd-tr)*1.1;ay+=Math.sin(tm*.6+f.ph)*.25;spd=1.8}
     else if(s.fmd===2){ax+=(s.x-f.x)*.2;az+=(s.z-f.z)*.2;ay+=(-s.d-f.y)*.3}
     if(s.bt){const bdx=s.bt.x-f.x,bdz=s.bt.z-f.z,bd=H(bdx,bdz)||1;if(bd<40){const w=(1-s.bt.t/s.bt.life)*[1,1,.5,.7][SP.indexOf(sp)];ax+=bdx/bd*w*2.5;az+=bdz/bd*w*2.5;ay+=(-1.2-f.y)*w*.9;spd=Math.max(spd,1+w*.7)}}}
    const db=H(f.x-bx,f.z-bz);if(db<rb){const w=(1-db/rb)*cl(1.1+f.y/14,.25,1)*(s.fd?(eng<2.2?.35:.8):1),q=w*w*30*ns/(db||1);ax+=(f.x-bx)*q;az+=(f.z-bz)*q;ay-=w*2.5*ns;f.pn=Math.max(f.pn,w*ns*2)}
    if(f.pn>.15){ax+=Math.cos(f.rd)*f.pn*9;az+=Math.sin(f.rd)*f.pn*9}
    if(gap&&f.pn>.4&&!en&&H(f.x-gmx,f.z-gmz)<10){const dx=gx-f.x,dz=gz-f.z,d=H(dx,dz)||1;ax+=dx/d*f.pn*5;az+=dz/d*f.pn*5;ay-=f.pn*1.2}
    if(f.pn>.5||(s.fl>0&&!en))fast=1;
    if(ps&&ps.st!=='done'&&ps.sg.length&&Math.abs(f.x-ps.bx)<150&&Math.abs(f.z-ps.bz)<150)for(const sg of ps.sg){if(-f.y>=wd(ps,sg[4]))continue;const q=pDist(f.x,f.z,sg);if(q[0]<3){const w=(1-q[0]/3)*7/(q[0]||1);ax-=q[1]*w;az-=q[2]*w}}
    const ty=cl(en?-(ps.D*.7):-(s.d+f.oy)-(fast&&f.pn>.3?3:0),FL+.6,-.5);ay+=(ty-f.y)*.7-f.vy*1.4;
    const cs=Math.hypot(f.vx,f.vz)||.01,tg=cr*(fast?2.6:1)*spd*(en?.8:1)*(1+.2*Math.sin(tm*(1.4+f.ph*.2)+f.ph*3));ax+=f.vx/cs*(tg-cs)*.9;az+=f.vz/cs*(tg-cs)*.9;f.sm=spd}
   const a0=Math.atan2(f.vx,f.vz);f.vx+=ax*dt;f.vz+=az*dt;f.vy+=ay*dt;const hs=Math.hypot(f.vx,f.vz),mx=cr*(fast?4.2:1.6)*(f.sm||1);if(hs>mx){f.vx*=mx/hs;f.vz*=mx/hs}f.vy=cl(f.vy,-1.6,1.6);{const hh=Math.min(hs,mx),a1=Math.atan2(f.vx,f.vz),da=AD(a1,a0),mt=(fast?7:3.5)*dt;if(hh>.05&&Math.abs(da)>mt){const a2=a0+Math.sign(da)*mt;f.vx=Math.sin(a2)*hh;f.vz=Math.cos(a2)*hh}}
   f.x+=f.vx*dt;f.z+=f.vz*dt;f.y=cl(f.y+f.vy*dt,FL+.6,-.5);
   if(ps&&ps.st!=='done'&&ps.sg.length)wallPass(f);
   if(en&&ps.st!=='purse'&&!inPoly(f.x,f.z,ps.pts)){f.st=0;f.own=null;f.fl=10;const a=Math.atan2(f.z-ps.cz,f.x-ps.cx);f.fx=Math.cos(a);f.fz=Math.sin(a)}
   if(en&&ps&&ps.st==='purse'){const q=(inPoly(f.x,f.z,ps.pts)?.2:2)*dt*.8;f.x+=(ps.cx-f.x)*q;f.z+=(ps.cz-f.z)*q}
  }else if(f.st===1){const o=f.own;
`);
