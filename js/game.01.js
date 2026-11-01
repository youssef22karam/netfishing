// Net-fishing game (waits for window.sea) - part 1/5 (lines 1-219 of the original script). boot.js joins the parts back together.
__ss("game", `

import * as THREE from 'three';
const S=await new Promise(r=>{const f=()=>window.sea&&window.sea.boat?r(window.sea):setTimeout(f,60);f()});
const scene=S.scene,boat=S.boat,cam=S.camera,cl=THREE.MathUtils.clamp,R=Math.random,TAU=Math.PI*2,H=Math.hypot,FL=-16,$=q=>document.querySelector(q),rt=(a,b)=>a+(b-a)*R();
const G={cash:1500,rep:100,net:0,tier:[0,0,0,0],max:[0,0,0,0],up:{eng:0,lead:0,stealth:0,winch:0,tough:0,sonar:0},hold:0,val:0,mesh:1};
const NM=['Cast net','Trawl','Purse seine','Gillnet'],SZ=[[2.5,3.5,5,7],[8,13,19,26],[100,160,240,340],[60,100,160,240]],TC=[0,120,400,1100],MESH=[.2,.4,.7,1.2],
UP=[['eng','Engine',150],['lead','Lead line',100],['stealth','Stealth',120],['winch','Winch',100],['tough','Mesh strength',100],['sonar','Sonar',80]];
const SP=[{n:'Sardine',v:.7,len:.2,sw:1.3,d:[1,5],k:.9,c:0xcfe3ff,n0:[150,240]},{n:'Mackerel',v:1.8,len:.4,sw:2.4,d:[3,9],k:1.2,c:0x5fb2a2,n0:[70,115]},{n:'Cod',v:4.5,len:.7,sw:1.7,d:[12,15],k:.6,c:0xd1b070,n0:[30,48]},{n:'Tuna',v:14,len:1.2,sw:4.2,d:[4,10],k:1.7,c:0x4a6fb0,n0:[14,24]}];
const lv=k=>G.up[k],spdM=()=>1+.14*lv('eng'),bf=()=>[-Math.sin(boat.heading),-Math.cos(boat.heading)];
const stern=(k=3.6,sd=0)=>{const[fx,fz]=bf();return[boat.position.x-fx*k-fz*sd,boat.position.z-fz*k+fx*sd]};
let tm=0,drag=0,vEff=0,toast=0;
let say=t=>{const e=$('#nfm');e.textContent=t;e.style.opacity=1;toast=5};

/* ---------- position-based-dynamics rope/net solver (max-length constraints = slack nets) ---------- */
const mkP=(x,y,z,im=1,s=0,c=2)=>({x,y,z,vx:0,vy:0,vz:0,im,s,c,ox:x,oy:y,oz:z});
function solve(P,C,it){for(let k=0;k<it;k++)for(const c of C){const a=P[c[0]],b=P[c[1]],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,d=H(dx,dy,dz)||1e-6;if(d<=c[2])continue;const w=a.im+b.im;if(!w)continue;const q=(d-c[2])/d/w;a.x+=dx*q*a.im;a.y+=dy*q*a.im;a.z+=dz*q*a.im;b.x-=dx*q*b.im;b.y-=dy*q*b.im;b.z-=dz*q*b.im}}
function step(P,C,dt,it=4){
 for(const p of P){if(!p.im)continue;
  if(p.y>0){p.vy-=9.8*dt}else{const k=Math.min(1,dt*p.c);p.vx-=p.vx*k;p.vz-=p.vz*k;p.vy+=(p.s-p.vy)*Math.min(1,dt*3)}
  p.ox=p.x;p.oy=p.y;p.oz=p.z;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt}
 solve(P,C,it);
 for(const p of P){if(!p.im)continue;if(p.y<FL)p.y=FL;p.vx=(p.x-p.ox)/dt;p.vy=(p.y-p.oy)/dt;p.vz=(p.z-p.oz)/dt}}
const mkLines=(n,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*6),3));const l=new THREE.LineSegments(g,fadeMat(new THREE.LineBasicMaterial({color:col})));l.frustumCulled=false;l.renderOrder=4;scene.add(l);return l};
const setL=(l,a)=>{const b=l.geometry.attributes.position,m=b.array;let i=0;for(const s of a){if(i+6>m.length)break;m.set(s,i);i+=6}l.geometry.setDrawRange(0,i/3);b.needsUpdate=true};
const kill=l=>{if(l){scene.remove(l);l.geometry.dispose()}};
const segs=(P,C)=>C.map(c=>[P[c[0]].x,P[c[0]].y,P[c[0]].z,P[c[1]].x,P[c[1]].y,P[c[1]].z]);

/* ---------- rocks (trawl hazards) ---------- */
const rocks=[];for(let i=0;i<70;i++){const a=R()*TAU,d=45+R()*700,r=rt(3,8),h=rt(4,8),m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),new THREE.MeshBasicMaterial({color:0x4a4f55}));m.scale.y=h/r;const x=boat.position.x+Math.cos(a)*d,z=boat.position.z+Math.sin(a)*d;m.position.set(x,FL+h*.35,z);scene.add(m);rocks.push({x,z,r:r*.9,top:FL+h*1.35})}

/* ---------- fish & schools ---------- */
const fish=[],schools=[],fm=new THREE.InstancedMesh(new THREE.ConeGeometry(.5,2,5).rotateX(Math.PI/2),new THREE.MeshBasicMaterial(),4000);fm.frustumCulled=false;scene.add(fm);
function mkSchool(x,z,spi){const sp=SP[spi??R()*4|0],n=Math.round(rt(...sp.n0)),d=rt(...sp.d),s={sp,x,z,a:R()*TAU,d,d0:d,n,al:0,fl:0,vx:0,vz:0,rad:Math.sqrt(n)*.9+2,f:[]};
 for(let i=0;i<n&&fish.length<4000;i++){const r=s.rad*Math.sqrt(R()),a=R()*TAU,f={s,sp,ox:Math.cos(a)*r,oz:Math.sin(a)*r,oy:(R()-.5)*3,x:x+Math.cos(a)*r,z:z+Math.sin(a)*r,y:-d,vx:0,vz:0,st:0,fl:0,dl:0,fx:0,fz:0,own:null,cx:0,cy:0,cz:0,tw:0};f.px=f.x;f.pz=f.z;fish.push(f);s.f.push(f)}schools.push(s);return s}
const bx0=boat.position.x,bz0=boat.position.z;
for(let i=0;i<12;i++){const a=R()*TAU,d=i<3?rt(45,85):rt(90,380);mkSchool(bx0+Math.cos(a)*d,bz0+Math.sin(a)*d,i===0?0:i===1?1:undefined)}
{const c=new THREE.Color();fish.forEach((f,i)=>fm.setColorAt(i,c.set(f.sp.c)));fm.count=fish.length}
function respawn(s){const a=R()*TAU,d=rt(300,430);s.x=boat.position.x+Math.cos(a)*d;s.z=boat.position.z+Math.sin(a)*d;s.al=s.fl=0;s.d=s.d0;for(const f of s.f)if(f.st===0||f.st===3){f.st=0;const r=s.rad*Math.sqrt(R()),b=R()*TAU;f.x=f.px=s.x+Math.cos(b)*r;f.z=f.pz=s.z+Math.sin(b)*r;f.y=-s.d;f.fl=0}}
const ccw=(ax,az,bx,bz,cx,cz)=>(cz-az)*(bx-ax)>(bz-az)*(cx-ax);
const crosses=(ax,az,bx,bz,cx,cz,dx,dz)=>ccw(ax,az,cx,cz,dx,dz)!==ccw(bx,bz,cx,cz,dx,dz)&&ccw(ax,az,bx,bz,cx,cz)!==ccw(ax,az,bx,bz,dx,dz);
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i].z>z)!==(P[j].z>z)&&x<(P[j].x-P[i].x)*(z-P[i].z)/(P[j].z-P[i].z)+P[i].x)c=!c;return c};
const area=P=>{let a=0;for(let i=0;i<P.length;i++){const b=P[(i+1)%P.length];a+=P[i].x*b.z-b.x*P[i].z}return Math.abs(a)/2};
const wd=(p,t)=>p.st==='purse'?p.D:Math.min(p.D,(tm-t)*(.7+.3*lv('lead')));
function wallPass(f){for(const s of ps.sg){if(!crosses(s[0],s[1],s[2],s[3],f.px,f.pz,f.x,f.z))continue;if(-f.y>=wd(ps,s[4]))continue;
 const nx=-(s[3]-s[1]),nz=s[2]-s[0],l=H(nx,nz)||1,ux=nx/l,uz=nz/l,d=f.vx*ux+f.vz*uz;f.x=f.px;f.z=f.pz;f.vx-=2*d*ux;f.vz-=2*d*uz;if(f.fl>0){const e=f.fx*ux+f.fz*uz;f.fx-=2*e*ux;f.fz-=2*e*uz}return}}
function land(list){const by={};let v=0;for(const f of list){f.st=3;f.own=null;v+=f.sp.v;by[f.sp.n]=(by[f.sp.n]||0)+1}G.hold+=list.length;G.val+=v;return list.length+' fish ('+Object.entries(by).map(e=>e[1]+' '+e[0]).join(', ')+') ~$'+v}
const dm=new THREE.Object3D();
function fishStep(dt){
 const bx=boat.position.x,bz=boat.position.z;
 for(const s of schools){const d=H(s.x-bx,s.z-bz);if(d>400){respawn(s);continue}
  s.a+=(R()-.5)*dt*.7;const sp=s.sp.sw*.38*(s.fl>0?3.4:1);s.vx=Math.cos(s.a)*sp;s.vz=Math.sin(s.a)*sp;s.x+=s.vx*dt;s.z+=s.vz*dt;
  const rad=55+25*s.sp.k,noise=(.04+Math.pow(Math.abs(vEff)/8,1.6))*(1-.15*lv('stealth'))*(ps&&ps.st==='set'?1.5:1)*(tw?.8:1)*cl(1.15-s.d/14,.3,1);
  if(d<rad)s.al+=noise*s.sp.k*(1-d/rad)*dt*.45;s.al=Math.max(0,s.al-.12*dt);
  if(s.al>=1&&s.fl<=0){s.fl=9;s.al=0;s.a=Math.atan2(s.z-bz,s.x-bx);if(d<90)say(s.sp.n+' school spooked - slow down near them!')}
  if(s.fl>0){s.fl-=dt;s.d=Math.min(s.d+dt,13)}else s.d+=(s.d0-s.d)*dt*.05}
 for(let k=0;k<fish.length;k++){const f=fish[k],s=f.s,sp=f.sp;
  if(f.st===0||f.st===2){f.px=f.x;f.pz=f.z;let dvx,dvz,fast=0;
   if(f.dl>0){f.dl-=dt;if(f.dl<=0)f.fl=4}
   if(f.fl>0){f.fl-=dt;dvx=f.fx*sp.sw*(f.fsp||2.4);dvz=f.fz*sp.sw*(f.fsp||2.4);fast=1}
   else if(f.st===2){dvx=f.vx+(R()-.5)*8*dt*sp.sw;dvz=f.vz+(R()-.5)*8*dt*sp.sw}
   else{dvx=s.vx+(s.x+f.ox-f.x)*.9;dvz=s.vz+(s.z+f.oz-f.z)*.9;if(s.fl>0)fast=1}
   const m=H(dvx,dvz),mx=sp.sw*(fast?2.6:1.2);if(m>mx){dvx*=mx/m;dvz*=mx/m}
   const q=Math.min(1,dt*3);f.vx+=(dvx-f.vx)*q;f.vz+=(dvz-f.vz)*q;f.x+=f.vx*dt;f.z+=f.vz*dt;
   let ty=f.st===2?-(ps.D*.8):-(s.d+f.oy)-(fast?3:0);ty=cl(ty,FL+.6,-.7);const sv=(fast||f.st===2?1.5:.5)*dt;f.y+=cl(ty-f.y,-sv,sv);
   if(ps&&ps.st!=='done'&&ps.sg.length&&(f.st===2||f.st===0))wallPass(f);
   if(f.st===2&&ps&&ps.st!=='purse'&&!inPoly(f.x,f.z,ps.pts)){f.st=0;f.own=null;f.fl=10;const a=Math.atan2(f.z-ps.cz,f.x-ps.cx);f.fx=Math.cos(a);f.fz=Math.sin(a)}
   if(f.st===2&&ps&&ps.st==='purse'){f.x+=(ps.cx-f.x)*dt*.8*(inPoly(f.x,f.z,ps.pts)?.2:2);f.z+=(ps.cz-f.z)*dt*.8*(inPoly(f.x,f.z,ps.pts)?.2:2)}
  }else if(f.st===1){const o=f.own;
   if(o===cn&&cn){const c0=cn.P[0],m=Math.max(.4,cn.rr*.8),d=H(f.cx,f.cz);if(d>m){f.cx*=m/d;f.cz*=m/d}f.cy=cl(f.cy-dt*.3,cn.ry+.2,c0.y-.2);f.x=c0.x+f.cx;f.z=c0.z+f.cz;f.y=f.cy}
   else if(o===tw&&tw){const c=tw.cd;f.x=c.x+f.cx;f.y=c.y+f.cy;f.z=c.z+f.cz}
   else f.st=3}
  if(f.st===3)dm.scale.set(0,0,0);else{const L=sp.len*2.2;dm.position.set(f.x,f.y,f.z);dm.rotation.y=Math.atan2(f.vx,f.vz);dm.scale.set(L*.22,L*.28,L*.5)}
  dm.updateMatrix();fm.setMatrixAt(k,dm.matrix)}
 fm.instanceMatrix.needsUpdate=true}

/* ---------- aiming ---------- */
const ndc=new THREE.Vector2(0,.15),ray=new THREE.Raycaster(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),aim=new THREE.Vector3(),tp=new THREE.Vector3();
let aimT=-99;const aimEv=e=>{if(e.target===S.renderer.domElement){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1));aimT=tm}};addEventListener('pointermove',aimEv);addEventListener('pointerdown',aimEv);
const rMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,depthTest:false,depthWrite:false,side:THREE.DoubleSide});
const rg=new THREE.RingGeometry(.96,1,72).rotateX(-Math.PI/2),ret=new THREE.Mesh(rg,rMat(0xffffff)),ret2=new THREE.Mesh(new THREE.RingGeometry(.9,1,72).rotateX(-Math.PI/2),rMat(0x66ffaa)),guide=new THREE.Mesh(new THREE.RingGeometry(.985,1,96).rotateX(-Math.PI/2),rMat(0x66ffaa));
for(const m of[ret,ret2,guide]){m.renderOrder=999;m.visible=false;m.frustumCulled=false;scene.add(m)}

/* ---------- 1. CAST NET ---------- */
let cn=null,ch=0,cd=1,chOn=false,chSp=.35;
const handPos=()=>{const[fx,fz]=bf();return[boat.position.x-fz*1.3,boat.position.y+2.1,boat.position.z+fx*1.3]};
const castStart=()=>{if(cn)return say('Net in the water - HAUL (G)');if(G.cond[0]<=0)return notify('The cast net is torn');wear(0,.5);chOn=true;ch=0;cd=1};
function castRelease(){if(!chOn)return;chOn=false;const Rn=SZ[0][G.tier[0]],N=16,RG=4,o=handPos(),sp=chSp,dx=aim.x-o[0],dz=aim.z-o[2],Tf=cl(H(dx,dz)/20,.65,1.2),P=[],C=[],vx0=dx/Tf,vz0=dz/Tf,vy0=-o[1]/Tf+4.9*Tf;
 const c0=mkP(o[0],o[1],o[2],1,-.5,4);c0.vx=vx0;c0.vy=vy0;c0.vz=vz0;P.push(c0);
 for(let r=1;r<=RG;r++)for(let i=0;i<N;i++){const a=i/N*TAU,ca=Math.cos(a),sa=Math.sin(a),f=r/RG,p=mkP(o[0]+ca*.3*f,o[1],o[2]+sa*.3*f,r===RG?.35:1,r===RG?-(3.2+.9*lv('lead')):-(.9+.2*lv('lead'))*f,4),vr=sp*Rn*f/Tf*.9;p.vx=vx0+ca*vr;p.vz=vz0+sa*vr;p.vy=vy0;P.push(p)}
 const ix=(r,i)=>1+(r-1)*N+i;
 for(let r=1;r<=RG;r++)for(let i=0;i<N;i++){C.push([ix(r,i),ix(r,(i+1)%N),2*Rn*r/RG*Math.sin(Math.PI/N)]);C.push([r===1?0:ix(r-1,i),ix(r,i),Rn/RG])}
 cn={P,C,st:'fly',t:0,tl:0,Rn,sp,ln:mkLines(C.length,0xe8dcc0),rr:0,ry:0,tear:0}}
function castStep(dt){const n=cn,P=n.P,c0=P[0],rim=P.slice(-16);n.t+=dt;
 const sub=Math.ceil(dt/.0167);for(let i=0;i<sub;i++)step(P,n.C,dt/sub,4);
 if(n.st==='fly'&&c0.y<0){n.st='sink';n.tl=n.t;const rr=rim.reduce((s,p)=>s+H(p.x-c0.x,p.z-c0.z),0)/16;let best=1e9,bs=null;for(const s of schools){const d=H(s.x-c0.x,s.z-c0.z);if(d<best){best=d;bs=s}}
  say('Spread '+Math.round(cl(rr/n.Rn,0,1)*100)+'%'+(bs?' · aim '+Math.round(cl(1-best/(bs.rad+n.Rn),0,1)*100)+'%':''));
  for(const f of fish)if(f.st===0){const d=H(f.x-c0.x,f.z-c0.z);if(d<n.Rn*1.8+3){f.dl=(.55+R()*.6)/f.sp.k;f.fsp=1.1;const a=Math.atan2(f.z-c0.z,f.x-c0.x);f.fx=Math.cos(a);f.fz=Math.sin(a)}}}
 if(n.st!=='fly'){n.ry=rim.reduce((s,p)=>s+p.y,0)/16;n.rr=rim.reduce((s,p)=>s+H(p.x-c0.x,p.z-c0.z),0)/16;
  for(const f of fish)if(f.st===0&&H(f.x-c0.x,f.z-c0.z)<n.rr*.94&&f.y>n.ry+.3&&f.y<c0.y){f.st=1;f.own=n;f.cx=f.x-c0.x;f.cz=f.z-c0.z;f.cy=f.y}
  for(const p of rim)for(const r of rocks)if(p.y<r.top&&H(p.x-r.x,p.z-r.z)<r.r)n.tear+=dt*(1-.14*lv('tough'));
  if(n.tear>1){n.tear=0;let c=0;for(const f of fish)if(f.own===n&&R()<.25){f.st=0;f.own=null;f.fl=4;f.fx=R()-.5;f.fz=R()-.5;c++}(say('Net snagged on rocks - lost '+c+' fish! (Mesh strength helps)'),wear(0,6))}
  if(n.st==='sink'){let cv=0,un=0;for(const f of fish){if(f.own===n)cv++;else if(f.st===0&&f.y<=n.ry+.3&&f.y<c0.y&&H(f.x-c0.x,f.z-c0.z)<n.rr*.94)un++}n.cov=cv;n.und=un;if(n.t-n.tl>9)castClose()}}
 if(n.st==='haul'){const h=handPos(),dx=h[0]-c0.x,dy=h[1]-c0.y,dz=h[2]-c0.z,d=H(dx,dy,dz)||1;c0.im=0;const v=Math.min(d,(2.4+.7*lv('winch'))*dt);c0.x+=dx/d*v;c0.y+=dy/d*v;c0.z+=dz/d*v;
  for(let i=1;i<P.length;i++){const p=P[i];p.vx+=(c0.x-p.x)*3*dt;p.vz+=(c0.z-p.z)*3*dt}
  if(d<2.5&&n.mgd!==0){const qc=n.qc||0,qh=n.qh??.5;say(settle(n,.5*qc+.5*qh,'Cast net: ')+' · close '+Math.round(qc*100)+'% · haul '+Math.round(qh*100)+'%');kill(n.ln);cn=null;return}}
 setL(n.ln,segs(P,n.C))}

/* ---------- 2. TRAWL ---------- */
let tw=null,twId=0;
function trawlSet(){if(tw)return say('Net already out - HAUL (G)');
 const W=SZ[1][G.tier[1]],Hh=W*.5,[fx,fz]=bf(),rx=-fz,rz=fx,P=[],C=[],add=(x,y,z,im,s,c)=>P.push(mkP(x,y,z,im,s,c))-1,[sx,sz]=stern(3.2),by=boat.position.y+1.2,ws=28/5,wc=[];
 const aL=add(sx-rx*1.3,by,sz-rz*1.3,0),aR=add(sx+rx*1.3,by,sz+rz*1.3,0);
 const chain=(a,sd)=>{let pr=a;for(let k=1;k<=5;k++){const d=k*ws+3,i=add(sx-fx*d+rx*sd*k*.8,by-.2*k,sz-fz*d+rz*sd*k*.8,k<5?1:.14,k<5?-.8:-2.2,k<5?.5:1);const c=[pr,i,ws];C.push(c);wc.push(c);pr=i}return pr};
 const bL=chain(aL,-1),bR=chain(aR,1),e=i=>[Math.cos(i*TAU/8)*W/2,Math.sin(i*TAU/8)*Hh/2],ed=(i,j,k=1)=>H((e(i)[0]-e(j)[0])*k,(e(i)[1]-e(j)[1])*k),
 mx=sx-fx*50,mz=sz-fz*50,m=[],Lb=W*.75,rings=[m];
 for(let i=0;i<8;i++)m.push(add(mx+rx*e(i)[0]*.25,by-8+e(i)[1]*.25,mz+rz*e(i)[0]*.25,1,i>0&&i<4?.9:i>4?-2:-.3,1.6));
 for(let i=0;i<8;i++)C.push([m[i],m[(i+1)%8],ed(i,i+1)]);C.push([m[0],m[4],W],[m[2],m[6],Hh],[m[1],m[5],ed(1,5)],[m[3],m[7],ed(3,7)],[bL,m[4],9],[bR,m[0],9]);
 for(let k=1;k<=3;k++){const rk=[],rf=[.82,.55,.3][k-1];for(let i=0;i<8;i++)rk.push(add(mx-fx*k*Lb*.3+rx*e(i)[0]*.2,by-8+e(i)[1]*.2,mz-fz*k*Lb*.3+rz*e(i)[0]*.2,1,-.35,2.2));
  for(let i=0;i<8;i++){C.push([rk[i],rk[(i+1)%8],ed(i,i+1,rf)],[rings[k-1][i],rk[i],Lb])}rings.push(rk)}
 const cod=add(mx-fx*Lb*1.4,by-8,mz-fz*Lb*1.4,1,-.35,2.4);for(let i=0;i<8;i++)C.push([rings[3][i],cod,Lb*.8]);
 tw={id:++twId,P,C,wc,W,Hh,wl:28,tw:28,hp:100*(1+.35*lv('tough')),m,r1:rings[1],cod,bL,bR,n:0,cap:180+270*G.tier[1],haul:false,snag:false,W2:0,H2:0,ln:mkLines(C.length+30,0xcfe8ff),vis:rings.slice(0,3).flatMap((r,k)=>r.map((a,i)=>[a,rings[k+1][(i+1)%8],1]))};
 say('Net shot. Q/E = pay out / haul warp. Tow 3-6 kn, keep it off the rocks')}
function trawlStep(dt){const T=tw,P=T.P,[fx,fz]=bf(),rx=-fz,rz=fx,[sx,sz]=stern(3.2),by=boat.position.y+1.2;
 P[0].x=sx-rx*1.3;P[0].y=by;P[0].z=sz-rz*1.3;P[1].x=sx+rx*1.3;P[1].y=by;P[1].z=sz+rz*1.3;
 T.wl+=cl(T.tw-T.wl,-dt*(10+4*lv('winch')),dt*10);const ws=T.wl/5;T.wc.forEach(c=>c[2]=ws);
 const F=cl(.9*vEff*vEff,0,14),bL=P[T.bL],bR=P[T.bR];bL.vx-=rx*F*dt;bL.vz-=rz*F*dt;bR.vx+=rx*F*dt;bR.vz+=rz*F*dt;
 const sub=Math.ceil(dt/.0167);for(let i=0;i<sub;i++)step(P,T.C,dt/sub,6);
 let sn=false;for(const p of P){if(!p.im)continue;for(const r of rocks)if(p.y<r.top&&H(p.x-r.x,p.z-r.z)<r.r){sn=true;p.x=p.ox;p.z=p.oz;p.vx=p.vz=0}}
 T.snag=sn;if(sn){T.hp-=dt*(10+Math.abs(vEff)*10)*(1-.12*lv('tough'));if(!T.sw){T.sw=1;say('SNAGGED! Slow down and haul up (E)!')}}else T.sw=0;
 if(T.hp<=0){say('Net torn off on the rocks! Catch lost.');for(const f of fish)if(f.own===T){f.st=0;f.own=null;f.fl=5;f.fx=R()-.5;f.fz=R()-.5}kill(T.ln);tw=null;return}
 const m=T.m.map(i=>P[i]),Mc={x:0,y:0,z:0},r1={x:0,y:0,z:0};m.forEach(p=>{Mc.x+=p.x/8;Mc.y+=p.y/8;Mc.z+=p.z/8});T.r1.forEach(i=>{r1.x+=P[i].x/8;r1.y+=P[i].y/8;r1.z+=P[i].z/8});
 let a=[Mc.x-r1.x,Mc.y-r1.y,Mc.z-r1.z];const al=H(...a)||1;a=a.map(v=>v/al);let ux=a[2],uz=-a[0];const ul=H(ux,uz)||1;ux/=ul;uz/=ul;const vx=a[1]*uz,vy=a[2]*ux-a[0]*uz,vz=-a[1]*ux,
 W=H(m[0].x-m[4].x,m[0].y-m[4].y,m[0].z-m[4].z),Hc=H(m[2].x-m[6].x,m[2].y-m[6].y,m[2].z-m[6].z);T.W2=W;T.H2=Hc;T.my=Mc.y;
 for(const f of fish){if(f.st!==0||f.tw===T.id)continue;const dx=f.x-Mc.x,dy=f.y-Mc.y,dz=f.z-Mc.z;if(Math.abs(dx)>40||Math.abs(dz)>40)continue;const A=dx*a[0]+dy*a[1]+dz*a[2];if(A<-1.6||A>.7)continue;
  const L=dx*ux+dz*uz,V=dx*vx+dy*vy+dz*vz;if(Math.abs(L)<W*.5&&Math.abs(V)<Hc*.5){f.tw=T.id;const p=cl((Math.abs(vEff)*1.1+.4)/(f.sp.sw*1.2),.06,.96)*(T.n<T.cap?1:0);
   if(R()<p){f.st=1;f.own=T;f.cx=(R()-.5)*2.4;f.cy=(R()-.5)*1.6;f.cz=(R()-.5)*2.4;T.n++}else{f.fl=3;f.fx=ux*(L>0?1:-1);f.fz=uz*(L>0?1:-1)}}}
 if(T.haul&&T.wl<15&&H(Mc.x-boat.position.x,Mc.z-boat.position.z)<18){const l=fish.filter(f=>f.own===T);say(l.length?'Trawl: '+land(l):'Trawl came up empty');kill(T.ln);tw=null;return}
 setL(T.ln,segs(P,T.C).concat(T.vis.map(v=>[P[v[0]].x,P[v[0]].y,P[v[0]].z,P[v[1]].x,P[v[1]].y,P[v[1]].z])))}

/* ---------- 3. PURSE SEINE ---------- */
let ps=null;
function seineSet(){if(ps&&ps.st!=='done')return say('Seine already out');const[x,z]=stern(3.4);let b=1e9,sz=0;for(const s of schools){const d=H(s.x-x,s.z-z);if(d<b&&d<130){b=d;sz=s.n}}
 ps={st:'set',bx:x,bz:z,pts:[{x,z,t:tm}],L:SZ[2][G.tier[2]],used:0,D:[8,11,14,17][G.tier[2]],t0:tm,sg:[],tp:0,sz,cx:x,cz:z,ln:mkLines(700,0xffd27a),bu:new THREE.Mesh(new THREE.SphereGeometry(.9,10,8),new THREE.MeshBasicMaterial({color:0xff7a2a}))};ps.bu.position.set(x,.4,z);scene.add(ps.bu);say('Seine set. Circle the school, return to the buoy, then PURSE (G)')}
function purseStep(dt){const p=ps,P=p.pts;
 if(p.st==='set'){const[sx,sz]=stern(3.4),l=P[P.length-1];
  if(!p.out&&H(sx-l.x,sz-l.z)>3.2){P.push({x:sx,z:sz,t:tm});p.used+=3.2;if(p.used>=p.L){p.out=true;say('Net ran out before the ring closed')}}
  if(!p.out&&P.length>9&&H(sx-p.bx,sz-p.bz)<18&&area(P)>150){p.st='closed';P.push({x:p.bx,z:p.bz,t:tm});p.tc=tm;let n=0;for(const f of fish)if(f.st===0&&inPoly(f.x,f.z,P)){f.st=2;f.own=p;f.fl=0;n++}
   p.A=area(P);p.per=P.reduce((s,q,i)=>s+(i?H(q.x-P[i-1].x,q.z-P[i-1].z):0),0);p.rnd=cl(4*Math.PI*p.A/(p.per*p.per),0,1);say('Ring closed: '+n+' fish inside')}}
 if(p.st!=='set'){let cx=0,cz=0;const q=P.slice(0,-1);q.forEach(a=>{cx+=a.x/q.length;cz+=a.z/q.length});p.cx=cx;p.cz=cz}
 if(p.st==='purse'){if(MG.on&&MG.t==='tension')p.tp=Math.max(p.tp,MG.prog);else if(!MG.on)p.tp=1;const s=Math.min(1,p.tp);P.forEach((a,i)=>{if(!a.o)a.o=[a.x,a.z];a.x=p.cx+(a.o[0]-p.cx)*(1-.93*s);a.z=p.cz+(a.o[1]-p.cz)*(1-.93*s)});
  if(p.tp>=1){const l=fish.filter(f=>f.own===p&&f.st===2&&R()<(.65+.35*MG.q)*(.6+.4*G.cond[2]/100));say('Purse seine: '+land(l)+(p.sz?' · '+Math.round(l.length/p.sz*100)+'% of the school':''));endSeine();return}}
 mkSg(p);setL(p.ln,wallLines(p))}
function mkSg(p){const P=p.pts,o=[];for(let i=0;i<P.length-1;i++)o.push([P[i].x,P[i].z,P[i+1].x,P[i+1].z,(P[i].t+P[i+1].t)/2]);if(p.st==='set'){const l=P[P.length-1],[sx,sz]=stern(3.4);o.push([l.x,l.z,sx,sz,l.t])}p.sg=o}
function wallLines(p){const o=[];for(const s of p.sg){const d=wd(p,s[4]);o.push([s[0],.2,s[1],s[2],.2,s[3]],[s[0],-d,s[1],s[2],-d,s[3]],[s[0],.2,s[1],s[0],-d,s[1]]);if(d>2)o.push([s[0],-d/2,s[1],s[2],-d/2,s[3]])}return o}
function endSeine(){wear(2,2.5);for(const f of fish)if(f.own===ps){f.st=0;f.own=null}kill(ps.ln);scene.remove(ps.bu);ps.st='done';ps=null}

/* ---------- 4. GILLNET (passive, soaks while you explore) ---------- */
let gl=[],lay=null;
const hot=(x,z)=>.25+1.75*Math.max(0,Math.sin(x*.007+1)*Math.sin(z*.006+2)),hr=()=>S.P.hour;
function gillAct(){if(lay){lay=null;return say('Gillnet set. Sail off; soak time with J, haul with G beside it')}
 const[x,z]=stern(3.4),t=G.tier[3],n={pts:[{x,z}],used:0,L:SZ[3][t],D:[6,8,10,13][t],mesh:G.mesh,hours:0,c:[0,0,0,0],by:0,hp:Math.max(1,G.cond[3])*(1+.4*lv('tough')),ln:mkLines(500,0xffc880)};gl.push(n);lay=n;say('Laying gillnet - drive straight; F again to finish')}
function gillDraw(n){const o=[];for(let i=0;i<n.pts.length;i++){const a=n.pts[i],b=n.pts[i+1];o.push([a.x,.2,a.z,a.x,-n.D,a.z]);if(b)o.push([a.x,.2,a.z,b.x,.2,b.z],[a.x,-n.D,a.z,b.x,-n.D,b.z],[a.x,-n.D/2,a.z,b.x,-n.D/2,b.z])}setL(n.ln,o)}
function soak(){if(!gl.length)return say('Set a gillnet first (net 4, F)');if(lay)lay=null;let msg='',ev=0;
 for(let h=0;h<3;h++){S.P.hour=(hr()+1)%24;for(const n of gl){n.hours++;const hs=hot(n.pts[0].x,n.pts[0].z),di=1+.45*Math.cos((hr()-6)*TAU/12);
  SP.forEach((sp,i)=>{const mt=Math.exp(-Math.pow(Math.log(sp.len/MESH[n.mesh]),2)/(2*.09)),ov=Math.max(0,Math.min(n.D,sp.d[1])-sp.d[0])/(sp.d[1]-sp.d[0]);n.c[i]+=[26,14,8,3][i]*(n.L/100)*mt*ov*hs*di*(.6+.8*R())});
  if(n.hours>6&&R()<.14*(n.hours-6)/6){n.hp-=25+R()*20;n.c=n.c.map(v=>v*.7);msg+='Shark tore the net! ';ev++}
  if(R()<.02*n.hours*(n.D<=8?1.6:1)){n.by++;msg+='Bycatch: turtle/dolphin tangled! ';ev++}}}
 say('Soaked 3h. '+(msg||'Quiet.')+' Net(s) fishing ~'+gl.reduce((s,n)=>s+n.c.reduce((a,b)=>a+b,0),0).toFixed(0)+' fish')}
function gillHaul(){const[x,z]=stern(0);let n=null;for(const g of gl)if(g.pts.some(p=>H(p.x-x,p.z-z)<35))n=g;if(!n)return false;
 const l=n.c.map(v=>Math.floor(v)),v=l.reduce((s,k,i)=>s+k*SP[i].v,0),k=l.reduce((a,b)=>a+b,0);G.hold+=k;G.val+=v;let m='Gillnet hauled after '+n.hours+'h: '+k+' fish +$'+Math.round(v);
 if(n.by){G.rep=Math.max(0,G.rep-10*n.by);G.cash-=80*n.by;m+=' · BYCATCH x'+n.by+': fine $'+80*n.by+', reputation '+G.rep}
 G.cond[3]=cl(n.hp/(1+.4*lv('tough')),0,100);if(n.hp<=0)m+=' · net destroyed';kill(n.ln);gl=gl.filter(g=>g!==n);say(m);return true}

/* ---------- actions, shop, UI ---------- */
const actDown=()=>[castStart,trawlSet,seineSet,gillAct][G.net](),actUp=()=>{if(G.net===0)castRelease()};
function haul(){const n=G.net;if(n===0){if(cn&&cn.st==='sink')cn.st='haul'}
 else if(n===1){if(tw){tw.haul=true;tw.tw=8;say('Hauling the trawl...')}}
 else if(n===2){if(ps){if(ps.st==='closed'){ps.st='purse';ps.tp=0;for(const w of ps.pts)w.o=null;say('Pursing the lead line...')}else if(ps.st==='set'){say('Seine recovered, nothing caught');endSeine()}}}
 else if(!gillHaul())say('Get within 35 m of a gillnet to haul it')}
const warp=d=>{if(tw){tw.auto=false;tw.tw=cl(tw.tw+d*12,6,110);tw.haul=false}};
let sell=()=>{const p=Math.round(G.val*cl(G.rep/100,.5,1.1));G.cash+=p;say('Sold '+G.hold+' fish for $'+p);G.hold=0;G.val=0};
const cyc=()=>{G.net=(G.net+1)%4},tierC=()=>{const n=G.net;G.tier[n]=(G.tier[n]+1)%(G.max[n]+1)},mesh=()=>{G.mesh=(G.mesh+1)%4;say('Gillnet mesh: '+SP[G.mesh].n+' size')};
const ui=document.createElement('div');ui.id='nf';ui.innerHTML='<style>#nf{position:fixed;right:8px;top:166px;width:216px;font:11px ui-monospace,monospace;background:rgba(10,18,30,.74);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:8px;z-index:5}#nf b{color:#7fd6ff}#nf button{background:rgba(40,60,90,.85);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:6px 7px;margin:2px 1px;font:inherit}#nf .r{display:flex;flex-wrap:wrap}#nfi{margin:4px 0;line-height:1.35}#nfm{position:fixed;left:50%;top:92px;transform:translateX(-50%);background:rgba(10,18,30,.88);padding:7px 14px;border-radius:12px;font:600 13px system-ui;opacity:0;transition:opacity .4s;pointer-events:none;text-align:center;max-width:80vw;z-index:6}#nfs{position:fixed;right:8px;top:8px;border-radius:50%;background:rgba(5,25,40,.7);border:1px solid #7fd6ff;z-index:5}#nfk{height:9px;background:#234;border-radius:5px;margin:4px 0;position:relative;display:none}#nfk i{position:absolute;left:0;top:0;bottom:0;background:#4ee08a;border-radius:5px}#nfk u{position:absolute;left:87%;right:0;top:-2px;bottom:-2px;border:2px solid #fff;border-radius:5px}#nfp{display:none;margin-top:6px}</style><div id=nft></div><div id=nfk><i></i><u></u></div><div id=nfi></div><div class=r id=nfb></div><div id=nfp></div>';
document.body.append(ui);const nm=document.createElement('div');nm.id='nfm';document.body.append(nm);ui.addEventListener('pointerdown',e=>e.stopPropagation());
[['Net N',cyc],['Size T',tierC],['ACT F'],['HAUL G',()=>haul()],['Warp+ Q',()=>warp(1)],['Warp- E',()=>warp(-1)],['Mesh M',mesh],['Wait 3h J',()=>soak()],['Sell H',()=>sell()],['Shop U',()=>shop()]].forEach(([t,fn])=>{const b=document.createElement('button');b.textContent=t;if(fn)b.onclick=fn;else{b.onpointerdown=actDown;b.onpointerup=b.onpointerleave=actUp}$('#nfb').append(b)});
const upC=k=>Math.round(UP.find(u=>u[0]===k)[2]*(1+lv(k)*1.1));
function shop(open){const p=$('#nfp');if(open===undefined)open=p.style.display!=='block';p.style.display=open?'block':'none';if(!open)return;
 p.innerHTML='<b>SHOP</b> $'+G.cash+'<div class=r>'+NM.map((n,i)=>G.max[i]<3?'<button data-t='+i+'>'+n+' size '+(G.max[i]+2)+' $'+TC[G.max[i]+1]+'</button>':'').join('')+UP.map(u=>lv(u[0])<5?'<button data-u='+u[0]+'>'+u[1]+' L'+(lv(u[0])+1)+' $'+upC(u[0])+'</button>':'').join('')+'</div>'}
$('#nfp').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.t!==undefined){const i=+b.dataset.t,c=TC[G.max[i]+1];if(G.cash>=c){G.cash-=c;G.max[i]++;G.tier[i]=G.max[i]}else say('Not enough cash')}else{const k=b.dataset.u,c=upC(k);if(G.cash>=c){G.cash-=c;G.up[k]++}else say('Not enough cash')}shop(true)};
addEventListener('keydown',e=>{if(e.repeat)return;const c=e.code;if(MG.on&&(c==='KeyG'||c==='KeyF')){MGpress(true);return}if(c==='KeyF')actDown();else if(c==='KeyG')haul();else if(c==='KeyN')cyc();else if(c==='KeyT')tierC();else if(c==='KeyQ')warp(1);else if(c==='KeyE')warp(-1);else if(c==='KeyM')mesh();else if(c==='KeyJ')soak();else if(c==='KeyH')sell();else if(c==='KeyU')shop()});
addEventListener('keyup',e=>{if(MG.on&&(e.code==='KeyG'||e.code==='KeyF')){MGpress(false);return}if(e.code==='KeyF')actUp()});
const sc=document.createElement('canvas');sc.id='nfs';sc.width=sc.height=150;document.body.append(sc);const sx=sc.getContext('2d');
function sonar(){const Rg=150+50*lv('sonar'),k=70/Rg,h=boat.heading,bx=boat.position.x,bz=boat.position.z,pr=(x,z)=>{const dx=x-bx,dz=z-bz;return[75+(dx*Math.cos(h)-dz*Math.sin(h))*k,75-(-dx*Math.sin(h)-dz*Math.cos(h))*k]};
 sx.clearRect(0,0,150,150);sx.strokeStyle='rgba(127,214,255,.3)';for(const r of[.33,.66,1]){sx.beginPath();sx.arc(75,75,70*r,0,TAU);sx.stroke()}
 sx.fillStyle='#667';for(const r of rocks){const p=pr(r.x,r.z);if(H(p[0]-75,p[1]-75)<72){sx.beginPath();sx.arc(p[0],p[1],Math.max(1.5,r.r*k),0,TAU);sx.fill()}}
 for(const s of schools){const p=pr(s.x,s.z);if(H(p[0]-75,p[1]-75)>72)continue;sx.fillStyle='#'+s.sp.c.toString(16).padStart(6,'0');sx.globalAlpha=s.fl>0?.45:.85;sx.beginPath();sx.arc(p[0],p[1],Math.max(2.5,s.rad*k),0,TAU);sx.fill();sx.globalAlpha=1;if(s.al>.3){sx.strokeStyle='#f64';sx.beginPath();sx.arc(p[0],p[1],Math.max(3,s.rad*k)+2,0,TAU*Math.min(1,s.al));sx.stroke()}}
 if(ps){sx.strokeStyle='#ffd27a';sx.beginPath();ps.pts.forEach((q,i)=>{const p=pr(q.x,q.z);i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1])});sx.stroke()}
 for(const g of gl){sx.strokeStyle='#ffc880';sx.beginPath();g.pts.forEach((q,i)=>{const p=pr(q.x,q.z);i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1])});sx.stroke()}
 if(tw){const m=tw.mc,p=pr(m.x,m.z);sx.fillStyle='#8cf';sx.fillRect(p[0]-2,p[1]-2,4,4)}
 sx.fillStyle='#fff';sx.beginPath();sx.moveTo(75,68);sx.lineTo(80,80);sx.lineTo(70,80);sx.fill()}

/* ---------- per-frame ---------- */
let uiT=0,snT=0;
function tick(dt){tm+=dt;const[fx,fz]=bf(),ex=boat.speed*dt*(spdM()*(1-drag)-1);boat.position.x+=fx*ex;boat.position.z+=fz*ex;vEff=boat.speed*spdM()*(1-drag);
 ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(pl,tp)){let dx=tp.x-boat.position.x,dz=tp.z-boat.position.z,d=H(dx,dz)||1;const m=cl(d,5,26);aim.set(boat.position.x+dx/d*m,0,boat.position.z+dz/d*m)}
 autoAim();if(chOn){ch+=cd*1.15*dt;if(ch>1){ch=1;cd=-1}if(ch<0){ch=0;cd=1}chSp=cl(.35+.75*ch,.35,1.05)}
 const Rn=SZ[0][G.tier[0]],y=S.S.y*.7+.3;let under=0;
 if(G.net===0&&!cn){const rr=chOn?Rn*chSp:Rn*.35;if(!chOn)chSp=.35;for(const f of fish)if(f.st===0&&H(f.x-aim.x,f.z-aim.z)<rr&&f.y>-9)under++;ret.visible=ret2.visible=true;ret.position.set(aim.x,y,aim.z);ret2.position.copy(ret.position);ret.scale.setScalar(Rn);ret2.scale.setScalar(rr);ret2.material.color.set(under>0?0x66ffaa:0xffb040)}else ret.visible=ret2.visible=false;
 let gs=null;if(G.net===2&&!ps){let b=1e9;for(const s of schools){const d=H(s.x-boat.position.x,s.z-boat.position.z);if(d<b&&d<160&&s.sp.k<2){b=d;gs=s}}}
 if(gs){const r=gs.rad+6;guide.visible=true;guide.position.set(gs.x,y,gs.z);guide.scale.setScalar(r);guide.material.color.set(2*Math.PI*r*1.1<=SZ[2][G.tier[2]]?0x66ffaa:0xff5a4a);guide.userData.r=r}else guide.visible=false;
 fishStep(dt);if(cn)castStep(dt);if(tw)trawlStep(dt);if(ps)purseStep(dt);
 if(lay){const[sx2,sz2]=stern(3.4),l=lay.pts[lay.pts.length-1];if(H(sx2-l.x,sz2-l.z)>5){lay.pts.push({x:sx2,z:sz2});lay.used+=5;gillDraw(lay);if(lay.used>=lay.L){lay=null;say('Gillnet fully set. Soak with J')}}}
 for(const g of gl)if(g!==lay&&!g.drawn){gillDraw(g);g.drawn=1}
 let td=0;if(tw){td=Math.min(.6,tw.W*tw.Hh*cl(tw.W2/tw.W,0,1)/560)*(1-.08*lv('eng'));if(tw.snag)td=.9}if(ps&&ps.st==='set')td=Math.max(td,.06+.08*G.tier[2]);if(cn&&cn.st==='haul')td=Math.max(td,.04);drag+=(td-drag)*Math.min(1,dt*3);
 if(toast>0){toast-=dt;if(toast<=0)nm.style.opacity=0}
 if((snT+=dt)>.12){snT=0;sonar()}
 if((uiT+=dt)>.2){uiT=0;const n=G.net,t=G.tier[n];let s='';
  if(n===0)s=cn?'Net '+cn.st+(cn.st==='sink'?' - HAUL (G) when it settles (auto in '+Math.max(0,9-(cn.t-cn.tl)).toFixed(0)+'s)':'')+' · '+fish.filter(f=>f.own===cn).length+' trapped':chOn?'Release F at the GREEN end - bigger spread = more fish':'Aim over a fish shadow, HOLD F, release at the peak · '+under+' fish under reticle';
  else if(n===1)s=tw?'warp '+tw.wl.toFixed(0)+'→'+tw.tw+' m · depth '+(-(tw.my||0)).toFixed(0)+' m · mouth '+tw.W2.toFixed(0)+'×'+tw.H2.toFixed(0)+' m · '+(vEff*1.944).toFixed(1)+' kn · HP '+Math.round(tw.hp/(100*(1+.35*lv('tough')))*100)+'% · bag '+tw.n+'/'+tw.cap:'F shoot net. Faster tow = wider mouth, fewer escapes, shallower net. Rocks on sonar snag it!';
`);
