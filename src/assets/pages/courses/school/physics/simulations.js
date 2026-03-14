// simulations.js — physics update + canvas drawing for all experiments

// ─── Shared state ──────────────────────────────────────────────────────────
let pendState   = { theta: Math.PI/6, omega: 0 };
let projState   = { x:0, y:0, vx:0, vy:0, trail:[], done:false };
let springState = { t:0 };
let waveState   = { t:0 };
let capState    = { t:0 };

function resetStates(expKey, p) {
  pendState   = { theta:(p.pAngle||30)*Math.PI/180, omega:0 };
  projState   = { x:0,y:0,vx:0,vy:0,trail:[],done:false };
  springState = { t:0 };
  waveState   = { t:0 };
  capState    = { t:0 };
}

// ─── Physics Update ────────────────────────────────────────────────────────
function physicsUpdate(expKey, dt, p) {
  const g = 9.8;
  if (expKey === 'pendulum') {
    const L = p.pLen||1, d = p.pDamp||0;
    const alpha = -(g/L)*Math.sin(pendState.theta) - d*pendState.omega;
    pendState.omega += alpha*dt;
    pendState.theta += pendState.omega*dt;
  }
  if (expKey === 'projectile' && !projState.done) {
    const v=p.pjVel||25, a=(p.pjAngle||45)*Math.PI/180, gv=p.pjGrav||9.8;
    if (projState.x===0 && projState.y===0) {
      projState.vx = v*Math.cos(a);
      projState.vy = v*Math.sin(a);
    }
    projState.x += projState.vx*dt;
    projState.y += projState.vy*dt;
    projState.vy -= gv*dt;
    projState.trail.push({x:projState.x, y:projState.y});
    if (projState.y < 0) { projState.y=0; projState.done=true; }
  }
  if (expKey === 'spring')   springState.t += dt;
  if (expKey === 'wave')     waveState.t += dt;
  if (expKey === 'capacitor') capState.t += dt;
}

// ─── Main Draw Dispatcher ──────────────────────────────────────────────────
function drawExperiment(canvas, expKey, p, simTime) {
  const ctx = canvas.getContext('2d');
  // canvas.width/height already set by app.js draw()
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  switch(expKey) {
    case 'pendulum':     drawPendulum(ctx,W,H,p);     break;
    case 'projectile':   drawProjectile(ctx,W,H,p);   break;
    case 'spring':       drawSpring(ctx,W,H,p);       break;
    case 'vibgyor':      drawVIBGYOR(ctx,W,H,p);      break;
    case 'snell':        drawSnell(ctx,W,H,p);        break;
    case 'wave':         drawWave(ctx,W,H,p);         break;
    case 'boyle':        drawBoyle(ctx,W,H,p);        break;
    case 'capacitor':    drawCapacitor(ctx,W,H,p);    break;
    case 'photoelectric':drawPhotoelectric(ctx,W,H,p);break;
  }
}

// ─── COLORS — CurioLab light theme ────────────────────────────────────────
const C = {
  cyan:   '#2ec4b6', cyanD: 'rgba(46,196,182,0.15)',
  blue:   '#7c5cbf',
  green:  '#2ec4b6', greenD:'rgba(46,196,182,0.15)',
  amber:  '#f4a261', amberD:'rgba(244,162,97,0.18)',
  red:    '#e05252', redD:  'rgba(224,82,82,0.15)',
  violet: '#7c5cbf', violetD:'rgba(124,92,191,0.15)',
  text:   '#1a1a2e', text2: '#6b6b80', text3: '#aaaabc',
  panel:  '#f8f6f1', panel2:'#f0ebff',
  border: 'rgba(124,92,191,0.12)',
};

// Helper: draw styled text (light-theme friendly, no glow)
function glowText(ctx, text, x, y, color, size=11) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px 'DM Mono', monospace`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Helper: axis lines
function drawAxis(ctx, gx, gy, W, H, lblX='', lblY='') {
  ctx.strokeStyle = C.border; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(gx,20); ctx.lineTo(gx,gy); ctx.lineTo(W-16,gy); ctx.stroke();
  ctx.fillStyle = C.text3; ctx.font = "9px 'Space Mono', monospace";
  if (lblY) ctx.fillText(lblY, gx+4, 16);
  if (lblX) ctx.fillText(lblX, W-70, gy+16);
}

// ─── PENDULUM ─────────────────────────────────────────────────────────────
function drawPendulum(ctx, W, H, p) {
  const pivX=W/2, pivY=52;
  const L=p.pLen||1, mass=p.pMass||0.5;
  const scale = Math.min((H-110)/2.2, 175);
  const bobX = pivX + Math.sin(pendState.theta)*L*scale;
  const bobY = pivY + Math.cos(pendState.theta)*L*scale;
  const r = 7 + mass*8;

  // Grid reference lines
  ctx.strokeStyle = C.border; ctx.lineWidth=0.5; ctx.setLineDash([3,5]);
  ctx.beginPath(); ctx.moveTo(pivX,pivY); ctx.lineTo(pivX,pivY+L*scale+r+16); ctx.stroke();
  // Angle arc
  ctx.strokeStyle = C.amber; ctx.lineWidth=1; ctx.setLineDash([2,4]);
  ctx.beginPath();
  const arcR=48;
  ctx.arc(pivX, pivY, arcR, Math.PI/2-0.05, Math.PI/2+Math.abs(pendState.theta), false);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ceiling bracket
  ctx.fillStyle = C.panel2;
  ctx.fillRect(pivX-44, pivY-14, 88, 14);
  for (let i=-3;i<=3;i++) {
    ctx.strokeStyle = C.border;
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pivX+i*12,pivY-14); ctx.lineTo(pivX+i*12-8,pivY-22); ctx.stroke();
  }

  // Rod
  ctx.strokeStyle = C.text2; ctx.lineWidth=2; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(pivX,pivY); ctx.lineTo(bobX,bobY); ctx.stroke();

  // Pivot
  ctx.fillStyle = C.amber;
  ctx.beginPath(); ctx.arc(pivX,pivY,6,0,Math.PI*2); ctx.fill();

  // Bob glow
  ctx.save();
  ctx.shadowColor = C.cyan; ctx.shadowBlur = 18;
  const grad = ctx.createRadialGradient(bobX-r*.35,bobY-r*.35,1,bobX,bobY,r);
  grad.addColorStop(0,'#88eaff'); grad.addColorStop(1,C.cyan);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(bobX,bobY,r,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // Trail ghost
  ctx.strokeStyle = 'rgba(56,200,255,0.08)'; ctx.lineWidth=1;

  // Angle label
  const midArcX = pivX + (arcR+12)*Math.sin(pendState.theta/2);
  const midArcY = pivY + (arcR+12)*Math.cos(pendState.theta/2);
  glowText(ctx, `${(pendState.theta*180/Math.PI).toFixed(1)}\u00b0`, midArcX+4, midArcY, C.amber, 10);

  // Bottom readings
  const T = 2*Math.PI*Math.sqrt((p.pLen||1)/9.8);
  glowText(ctx, `T = ${T.toFixed(3)} s`, 14, H-32, C.cyan, 10);
  glowText(ctx, `\u03c9 = ${pendState.omega.toFixed(3)} rad/s`, 14, H-16, C.green, 10);
  glowText(ctx, `\u03b8 = ${(pendState.theta*180/Math.PI).toFixed(2)}\u00b0`, 170, H-16, C.amber, 10);
}

// ─── PROJECTILE ───────────────────────────────────────────────────────────
function drawProjectile(ctx, W, H, p) {
  const gx=44, gy=H-46;
  const v=p.pjVel||25, gv=p.pjGrav||9.8;
  const a=(p.pjAngle||45)*Math.PI/180;
  const maxR=v*v/gv*1.1;
  const maxH=(v**2*Math.sin(a)**2)/(2*gv);
  const scaleX=(W-70)/maxR;
  const scaleY=(H-90)/Math.max(maxH,0.1);

  drawAxis(ctx, gx, gy, W, H, 'x (m)', 'y (m)');

  // Tick marks
  for (let i=1;i<=4;i++) {
    const tx=gx+i*(W-66)/4;
    const val=((maxR/1.1)*i/4).toFixed(0);
    ctx.fillStyle=C.text3; ctx.font="8px 'Space Mono',monospace";
    ctx.fillRect(tx,gy-2,1,5);
    ctx.fillText(val, tx-8, gy+14);
  }

  // Theoretical path (ghost)
  ctx.strokeStyle = 'rgba(100,180,255,0.08)'; ctx.lineWidth=1; ctx.setLineDash([3,5]);
  ctx.beginPath();
  for (let t=0; t<=2*v*Math.sin(a)/gv; t+=0.04) {
    const px=gx+v*Math.cos(a)*t*scaleX;
    const py=gy-(v*Math.sin(a)*t-0.5*gv*t*t)*scaleY;
    t===0? ctx.moveTo(px,py): ctx.lineTo(px,py);
  }
  ctx.stroke(); ctx.setLineDash([]);

  // Actual trail
  if (projState.trail.length>1) {
    ctx.save();
    ctx.shadowColor=C.green; ctx.shadowBlur=8;
    ctx.strokeStyle=C.green; ctx.lineWidth=2.5;
    ctx.beginPath();
    projState.trail.forEach((pt,i)=>{
      const px=gx+pt.x*scaleX, py=gy-Math.max(0,pt.y)*scaleY;
      i===0? ctx.moveTo(px,py): ctx.lineTo(px,py);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Ball
  if (!projState.done && projState.trail.length>0) {
    const last=projState.trail[projState.trail.length-1];
    const px=gx+last.x*scaleX, py=gy-Math.max(0,last.y)*scaleY;
    ctx.save(); ctx.shadowColor=C.amber; ctx.shadowBlur=16;
    ctx.fillStyle=C.amber;
    ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  if (projState.done) {
    const range=projState.trail[projState.trail.length-1].x;
    glowText(ctx, `Range: ${range.toFixed(1)} m`, gx+range*scaleX/3, gy-12, C.red, 11);
  }

  // Launch angle indicator
  const arrowLen=40;
  ctx.save(); ctx.strokeStyle=C.amber; ctx.lineWidth=1.5; ctx.shadowColor=C.amber; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx+arrowLen*Math.cos(a), gy-arrowLen*Math.sin(a)); ctx.stroke();
  ctx.restore();
  glowText(ctx, `${(p.pjAngle||45)}\u00b0`, gx+44, gy-22, C.amber, 10);
}

// ─── SPRING ──────────────────────────────────────────────────────────────
function drawSpring(ctx, W, H, p) {
  const k=p.spK||5, m=p.spM||0.5, A=p.spA||0.1;
  const omega=Math.sqrt(k/m);
  const x=A*Math.cos(omega*springState.t);

  const cx=W*.38, equilY=H/2+10, anchorY=36;
  const scale=(H*.32)/0.25;
  const bobY=equilY+x*scale;
  const springLen=bobY-anchorY-14;

  // Ceiling
  ctx.fillStyle='#f0ebff';
  ctx.fillRect(cx-50, anchorY-12, 100, 12);
  for(let i=-3;i<=3;i++){
    ctx.strokeStyle=C.border; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx+i*14,anchorY-12); ctx.lineTo(cx+i*14-7,anchorY-20); ctx.stroke();
  }

  // Equilibrium dashed line
  ctx.strokeStyle='rgba(46,216,160,0.25)'; ctx.lineWidth=0.75; ctx.setLineDash([4,6]);
  ctx.beginPath(); ctx.moveTo(cx-70,equilY); ctx.lineTo(cx+W*0.5,equilY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=C.green; ctx.font="9px 'Space Mono',monospace"; ctx.globalAlpha=0.5;
  ctx.fillText('equilibrium', cx+60, equilY+4);
  ctx.globalAlpha=1;

  // Spring coils
  const coils=14, amp=24;
  ctx.save(); ctx.strokeStyle=C.violet; ctx.lineWidth=2; ctx.shadowColor=C.violet; ctx.shadowBlur=6;
  ctx.beginPath();
  for(let i=0;i<=coils*12;i++){
    const t2=i/(coils*12);
    const sy=anchorY+t2*springLen;
    const sx=cx+amp*Math.sin(t2*coils*Math.PI*2);
    i===0? ctx.moveTo(sx,sy): ctx.lineTo(sx,sy);
  }
  ctx.stroke(); ctx.restore();

  // Mass block
  const bw=26+m*16, bh=26+m*10;
  ctx.save(); ctx.shadowColor=C.cyan; ctx.shadowBlur=14;
  ctx.fillStyle='#f0ebff'; ctx.strokeStyle=C.cyan; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.roundRect(cx-bw/2,bobY,bw,bh,4); ctx.fill(); ctx.stroke();
  ctx.restore();
  glowText(ctx, `${m}kg`, cx-14, bobY+bh/2+5, C.cyan, 10);

  // Displacement arrow
  if (Math.abs(x)>0.004) {
    const arrX=cx+bw/2+14;
    ctx.save(); ctx.strokeStyle=C.red; ctx.lineWidth=1.5; ctx.shadowColor=C.red; ctx.shadowBlur=6;
    ctx.beginPath(); ctx.moveTo(arrX,equilY); ctx.lineTo(arrX,bobY); ctx.stroke();
    ctx.restore();
    glowText(ctx, `x=${x.toFixed(3)}m`, arrX+5, (equilY+bobY)/2+4, C.red, 9);
  }

  // Energy bars (right side)
  const KE=0.5*m*(omega*x)**2, PE=0.5*k*x**2, E=0.5*k*A**2;
  const bx=W-110, barBase=H-44, barMaxH=90;
  ctx.fillStyle='#f8f6f1';
  ctx.fillRect(bx-12,barBase-barMaxH-20,108,barMaxH+36);
  const bars=[{l:'KE',v:KE,c:C.cyan},{l:'PE',v:PE,c:C.violet},{l:'E\u209c',v:E,c:C.amber}];
  bars.forEach((b,i)=>{
    const bh2=E>0?(b.v/E)*barMaxH:0;
    ctx.save(); ctx.shadowColor=b.c; ctx.shadowBlur=8;
    ctx.fillStyle=b.c;
    ctx.fillRect(bx+i*34, barBase-bh2, 26, bh2);
    ctx.restore();
    ctx.fillStyle=b.c; ctx.font="8px 'Space Mono',monospace";
    ctx.fillText(b.l, bx+i*34+2, barBase+12);
  });
  ctx.fillStyle=C.text3; ctx.font="8px 'Space Mono',monospace";
  ctx.fillText('ENERGY (J)', bx-8, barBase-barMaxH-8);

  // Stats
  glowText(ctx, `\u03c9 = ${omega.toFixed(3)} rad/s`, 14, H-28, C.cyan, 10);
  glowText(ctx, `T = ${(2*Math.PI/omega).toFixed(3)} s`, 14, H-12, C.green, 10);
}

// ─── VIBGYOR ─────────────────────────────────────────────────────────────
function drawVIBGYOR(ctx, W, H, p) {
  const prismAngle=(p.prismAngle||60)*Math.PI/180;
  const incAngle=(p.incAngle||45)*Math.PI/180;

  const cx=W/2, cy=H/2;
  const ps=Math.min(W,H)*0.35; // prism size

  // Prism vertices (equilateral-ish)
  const pA={x:cx, y:cy-ps*0.65};
  const pB={x:cx-ps*0.56, y:cy+ps*0.35};
  const pC={x:cx+ps*0.56, y:cy+ps*0.35};

  // Background glow behind prism
  ctx.save();
  const grd=ctx.createRadialGradient(cx,cy,10,cx,cy,ps*0.8);
  grd.addColorStop(0,'rgba(80,60,140,0.12)');
  grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,ps*0.8,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // Draw prism
  ctx.save();
  ctx.fillStyle='rgba(100,160,255,0.07)';
  ctx.strokeStyle='rgba(100,160,255,0.4)'; ctx.lineWidth=1.5;
  ctx.shadowColor='rgba(100,160,255,0.3)'; ctx.shadowBlur=12;
  ctx.beginPath();
  ctx.moveTo(pA.x,pA.y); ctx.lineTo(pB.x,pB.y); ctx.lineTo(pC.x,pC.y); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // Incident white ray (from left, hitting left face ~midpoint)
  const hitX=cx-ps*0.28, hitY=cy;
  const incLen=140;
  const incEndX=hitX-incLen*Math.cos(incAngle);
  const incEndY=hitY+incLen*Math.sin(incAngle)*0.4;

  // White beam in
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=3;
  ctx.shadowColor='white'; ctx.shadowBlur=12;
  ctx.beginPath(); ctx.moveTo(incEndX,incEndY); ctx.lineTo(hitX,hitY); ctx.stroke();
  ctx.restore();

  // VIBGYOR dispersed beams out (right face)
  const colors=[
    {name:'V',hex:'#8b00ff',n:1.530},
    {name:'I',hex:'#4b0082',n:1.526},
    {name:'B',hex:'#0055ff',n:1.522},
    {name:'G',hex:'#00cc55',n:1.518},
    {name:'Y',hex:'#ffe600',n:1.515},
    {name:'O',hex:'#ff8800',n:1.513},
    {name:'R',hex:'#ff2200',n:1.511},
  ];

  const exitX=cx+ps*0.28, exitBaseY=cy;
  const exitLen=160;
  const spread=3.5;

  colors.forEach((c,i)=>{
    const offset=(i-3)*spread;
    const angle=0.25+i*0.035;
    const ex=exitX+exitLen*Math.cos(angle);
    const ey=exitBaseY+exitLen*Math.sin(angle)*0.5+offset*1.2;

    ctx.save();
    ctx.strokeStyle=c.hex;
    ctx.lineWidth=2.2;
    ctx.shadowColor=c.hex; ctx.shadowBlur=14;
    ctx.globalAlpha=0.9;
    ctx.beginPath();
    ctx.moveTo(exitX, exitBaseY+offset*0.1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();

    // Labels
    ctx.fillStyle=c.hex;
    ctx.font="bold 10px 'Space Mono',monospace";
    ctx.fillText(c.name, ex+4, ey+4);
    ctx.fillStyle=C.text3;
    ctx.font="9px 'Space Mono',monospace";
    ctx.fillText(`n=${c.n}`, ex+16, ey+4);
  });

  // Refraction labels
  glowText(ctx, 'White light', incEndX-60, incEndY-6, 'rgba(255,255,255,0.7)', 10);
  glowText(ctx, `Prism angle: ${p.prismAngle||60}\u00b0`, cx-26, pC.y+20, C.cyan, 10);
  glowText(ctx, `Incident: ${p.incAngle||45}\u00b0`, incEndX+2, incEndY+14, C.text3, 9);

  // Spectrum bar at bottom
  const barW=W-80, barH=14, barX=40, barY=H-36;
  const rainbow=ctx.createLinearGradient(barX,0,barX+barW,0);
  rainbow.addColorStop(0,'#8b00ff');
  rainbow.addColorStop(0.17,'#4b0082');
  rainbow.addColorStop(0.33,'#0055ff');
  rainbow.addColorStop(0.5,'#00cc55');
  rainbow.addColorStop(0.67,'#ffe600');
  rainbow.addColorStop(0.83,'#ff8800');
  rainbow.addColorStop(1,'#ff2200');
  ctx.save(); ctx.shadowColor='white'; ctx.shadowBlur=8;
  ctx.fillStyle=rainbow;
  ctx.beginPath(); ctx.roundRect(barX,barY,barW,barH,3); ctx.fill();
  ctx.restore();
  glowText(ctx, 'V  I  B  G  Y  O  R', barX+barW/2-52, barY+barH+12, C.text2, 9);
}

// ─── SNELL'S LAW ─────────────────────────────────────────────────────────
function drawSnell(ctx, W, H, p) {
  const n1=p.opN1||1, n2=p.opN2||1.5;
  const th1=(p.opAngle||45)*Math.PI/180;
  const midY=H/2;

  // Media blocks
  ctx.fillStyle='rgba(56,200,255,0.04)';
  ctx.fillRect(0,0,W,midY);
  ctx.fillStyle='rgba(77,159,255,0.1)';
  ctx.fillRect(0,midY,W,H-midY);

  // Medium labels
  ctx.fillStyle='rgba(56,200,255,0.4)'; ctx.font="11px 'Space Mono',monospace";
  ctx.fillText(`n\u2081 = ${n1.toFixed(2)}  (${n1===1?'Air':n1<1.4?'Water':n1<1.6?'Glass':'Dense glass'})`, 14, midY-14);
  ctx.fillStyle='rgba(77,159,255,0.7)';
  ctx.fillText(`n\u2082 = ${n2.toFixed(2)}  (${n2===1?'Air':n2<1.4?'Water':n2<1.6?'Glass':'Dense glass'})`, 14, midY+22);

  // Interface line
  ctx.strokeStyle='rgba(100,180,255,0.25)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,midY); ctx.lineTo(W,midY); ctx.stroke();

  // Normal (dashed)
  ctx.strokeStyle=C.border; ctx.lineWidth=0.75; ctx.setLineDash([5,6]);
  ctx.beginPath(); ctx.moveTo(W/2,16); ctx.lineTo(W/2,H-16); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=C.text3; ctx.font="9px 'Space Mono',monospace";
  ctx.fillText('normal', W/2+4, 14);

  const len=Math.min(midY-28, W*0.3);

  // Incident ray
  const iX=W/2-Math.sin(th1)*len, iY=midY-Math.cos(th1)*len;
  ctx.save(); ctx.strokeStyle=C.amber; ctx.lineWidth=2.5; ctx.shadowColor=C.amber; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.moveTo(iX,iY); ctx.lineTo(W/2,midY); ctx.stroke();
  ctx.restore();

  // Angle arc + label
  ctx.strokeStyle=C.amber; ctx.lineWidth=0.75; ctx.setLineDash([2,3]);
  ctx.beginPath(); ctx.arc(W/2,midY,40,Math.PI/2-th1,Math.PI/2); ctx.stroke();
  ctx.setLineDash([]);
  glowText(ctx, `\u03b8\u2081=${(th1*180/Math.PI).toFixed(1)}\u00b0`, iX-52, iY+10, C.amber, 10);

  // Refracted / TIR
  const sinT2=(n1/n2)*Math.sin(th1);
  if (Math.abs(sinT2)<=1) {
    const th2=Math.asin(sinT2);
    const rX=W/2+Math.sin(th2)*len, rY=midY+Math.cos(th2)*len;
    ctx.save(); ctx.strokeStyle=C.cyan; ctx.lineWidth=2.5; ctx.shadowColor=C.cyan; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(W/2,midY); ctx.lineTo(rX,rY); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle=C.cyan; ctx.lineWidth=0.75; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.arc(W/2,midY,40,Math.PI/2,Math.PI/2+th2); ctx.stroke();
    ctx.setLineDash([]);
    glowText(ctx, `\u03b8\u2082=${(th2*180/Math.PI).toFixed(1)}\u00b0`, rX+6, rY-10, C.cyan, 10);
  } else {
    // TIR
    const reflX=W/2+Math.sin(th1)*len, reflY=midY-Math.cos(th1)*len;
    ctx.save(); ctx.strokeStyle=C.red; ctx.lineWidth=2.5; ctx.shadowColor=C.red; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.moveTo(W/2,midY); ctx.lineTo(reflX,reflY); ctx.stroke();
    ctx.restore();
    glowText(ctx, 'TOTAL INTERNAL REFLECTION', W/2-110, midY+44, C.red, 11);
  }

  if (n1>=n2) {
    const ca=Math.asin(n2/n1)*180/Math.PI;
    glowText(ctx, `Critical angle: ${ca.toFixed(1)}\u00b0`, W-180, midY-10, C.violet, 9);
  }
}

// ─── WAVE INTERFERENCE ────────────────────────────────────────────────────
function drawWave(ctx, W, H, p) {
  const freq=p.wFreq||1.5, sep=p.wSep||1.5, phase=(p.wPhase||0)*Math.PI/180;
  const t=waveState.t;
  const s1x=W/2-sep*36, s2x=W/2+sep*36, sy=H/2;

  // Pixel interference field
  const step=5;
  const k=0.05;
  for(let xi=0;xi<W;xi+=step){
    for(let yi=0;yi<H;yi+=step){
      const r1=Math.sqrt((xi-s1x)**2+(yi-sy)**2);
      const r2=Math.sqrt((xi-s2x)**2+(yi-sy)**2);
      if(r1<6||r2<6) continue;
      const w1=Math.sin(k*r1-freq*t*2.8);
      const w2=Math.sin(k*r2-freq*t*2.8+phase);
      const sum=(w1+w2)/2;
      const a=Math.pow(Math.abs(sum),0.55);
      if(sum>0.15) ctx.fillStyle=`rgba(56,200,255,${a*0.6})`;
      else if(sum<-0.15) ctx.fillStyle=`rgba(255,95,109,${a*0.6})`;
      else continue;
      ctx.fillRect(xi,yi,step,step);
    }
  }

  // Sources
  [s1x,s2x].forEach((sx,i)=>{
    ctx.save(); ctx.shadowColor=C.amber; ctx.shadowBlur=16;
    ctx.fillStyle=C.amber;
    ctx.beginPath(); ctx.arc(sx,sy,10,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle='#f8f6f1'; ctx.font="bold 9px 'Space Mono',monospace";
    ctx.fillText(`S${i+1}`,sx-8,sy+4);
  });

  // Legend
  ctx.fillStyle='rgba(248,246,241,0.85)';
  ctx.fillRect(10, H-32, W-20, 26);
  glowText(ctx, 'Constructive (cyan)', 18, H-15, C.cyan, 9);
  glowText(ctx, 'Destructive (red)', W/2+18, H-15, C.red, 9);
}

// ─── BOYLE'S LAW ─────────────────────────────────────────────────────────
function drawBoyle(ctx, W, H, p) {
  const V=p.blV||10, T=p.blTemp||300, n=p.blMol||0.5;
  const R=8.314;
  const pressure=(n*R*T)/V; // Pa... use kPa
  const P_kPa=pressure/1000;

  // PV graph
  const gx=56, gy=H-56;
  drawAxis(ctx, gx, gy, W*0.55, H, 'V (L)', 'P (kPa)');

  // Hyperbola curve (PV = const)
  const PVconst=P_kPa*V;
  const maxV=22, maxP=PVconst/1;
  const scaleX=(W*0.55-80)/maxV;
  const scaleY=(H-80)/Math.min(maxP,200);

  ctx.save(); ctx.strokeStyle=C.violet; ctx.lineWidth=2; ctx.shadowColor=C.violet; ctx.shadowBlur=8;
  ctx.beginPath();
  for(let v=0.5;v<=maxV;v+=0.2){
    const pv=PVconst/v;
    if(pv>200) continue;
    const px=gx+v*scaleX, py=gy-pv*scaleY;
    v===0.5? ctx.moveTo(px,py): ctx.lineTo(px,py);
  }
  ctx.stroke(); ctx.restore();

  // Current point
  const ptX=gx+V*scaleX, ptY=gy-P_kPa*scaleY;
  ctx.save(); ctx.fillStyle=C.cyan; ctx.shadowColor=C.cyan; ctx.shadowBlur=14;
  ctx.beginPath(); ctx.arc(ptX,ptY,8,0,Math.PI*2); ctx.fill(); ctx.restore();
  ctx.strokeStyle='rgba(56,200,255,0.2)'; ctx.lineWidth=0.75; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(ptX,gy); ctx.lineTo(ptX,ptY); ctx.moveTo(gx,ptY); ctx.lineTo(ptX,ptY); ctx.stroke();
  ctx.setLineDash([]);

  // Cylinder visual (right half)
  const cylX=W*0.62, cylW=100, cylH=180;
  const cylY=(H-cylH)/2;
  const fillH=cylH*(V/22);

  ctx.strokeStyle=C.border; ctx.lineWidth=1.5;
  ctx.strokeRect(cylX, cylY, cylW, cylH);
  ctx.fillStyle='rgba(56,200,255,0.08)';
  ctx.fillRect(cylX+1, cylY+cylH-fillH, cylW-2, fillH);

  // Piston
  const pistonY=cylY+cylH-fillH-8;
  ctx.fillStyle='#f0ebff'; ctx.strokeStyle=C.cyan; ctx.lineWidth=1.5;
  ctx.fillRect(cylX-8, pistonY, cylW+16, 14);
  ctx.strokeRect(cylX-8, pistonY, cylW+16, 14);

  // Pressure arrows on piston
  const arrowCount=Math.min(8, Math.round(P_kPa/10)+2);
  for(let i=0;i<arrowCount;i++){
    const ax=cylX+10+i*(cylW-20)/(arrowCount-1||1);
    ctx.save(); ctx.strokeStyle=C.red; ctx.lineWidth=1; ctx.shadowColor=C.red; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.moveTo(ax,pistonY-24); ctx.lineTo(ax,pistonY-2); ctx.stroke();
    // arrowhead
    ctx.beginPath(); ctx.moveTo(ax-4,pistonY-10); ctx.lineTo(ax,pistonY-2); ctx.lineTo(ax+4,pistonY-10); ctx.stroke();
    ctx.restore();
  }

  glowText(ctx, 'Gas molecules', cylX+4, cylY+cylH/2+fillH/4, C.text3, 8);

  // Readings
  glowText(ctx, `P = ${P_kPa.toFixed(2)} kPa`, W-170, H-52, C.cyan, 10);
  glowText(ctx, `V = ${V.toFixed(1)} L`, W-170, H-36, C.green, 10);
  glowText(ctx, `T = ${T} K`, W-170, H-20, C.amber, 10);
  glowText(ctx, `PV = ${(P_kPa*V).toFixed(1)}`, W-170, H-4, C.violet, 10);
}

// ─── CAPACITOR CHARGING ───────────────────────────────────────────────────
function drawCapacitor(ctx, W, H, p) {
  const C_uf=p.capC||100, R_k=p.capR||10, V0=p.capV||12;
  const tau=(C_uf*1e-6)*(R_k*1e3); // seconds
  const t=capState.t;
  const Vt=V0*(1-Math.exp(-t/tau));
  const It=(V0/(R_k*1e3))*Math.exp(-t/tau)*1000; // mA

  const gx=46, gy=H-50;
  drawAxis(ctx, gx, gy, W*0.6, H, 'time (s)', 'V (volt)');

  // V0 reference line
  ctx.strokeStyle='rgba(255,184,77,0.2)'; ctx.lineWidth=0.75; ctx.setLineDash([4,5]);
  const maxT=tau*6, scaleX=(W*0.6-70)/maxT, scaleY=(H-80)/V0;
  ctx.beginPath(); ctx.moveTo(gx,gy-V0*scaleY); ctx.lineTo(W*0.6,gy-V0*scaleY); ctx.stroke();
  ctx.setLineDash([]);
  glowText(ctx, `V\u2080=${V0}V`, W*0.6-46, gy-V0*scaleY-4, C.amber, 9);

  // tau line
  ctx.strokeStyle='rgba(167,139,250,0.2)'; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(gx+tau*scaleX,gy); ctx.lineTo(gx+tau*scaleX,gy-V0*scaleY); ctx.stroke();
  ctx.setLineDash([]);
  glowText(ctx, `\u03c4=${tau.toFixed(2)}s`, gx+tau*scaleX+4, gy-14, C.violet, 9);

  // Charging curve (full)
  ctx.save(); ctx.strokeStyle='rgba(56,200,255,0.25)'; ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let tt=0;tt<=maxT;tt+=maxT/200){
    const v=V0*(1-Math.exp(-tt/tau));
    const px=gx+tt*scaleX, py=gy-v*scaleY;
    tt===0? ctx.moveTo(px,py): ctx.lineTo(px,py);
  }
  ctx.stroke(); ctx.restore();

  // Actual traced curve
  ctx.save(); ctx.strokeStyle=C.cyan; ctx.lineWidth=2.5; ctx.shadowColor=C.cyan; ctx.shadowBlur=8;
  ctx.beginPath();
  for(let tt=0;tt<=Math.min(t,maxT);tt+=maxT/200){
    const v=V0*(1-Math.exp(-tt/tau));
    const px=gx+tt*scaleX, py=gy-v*scaleY;
    tt===0? ctx.moveTo(px,py): ctx.lineTo(px,py);
  }
  ctx.stroke(); ctx.restore();

  // Current dot
  if(t<=maxT){
    const ptX=gx+t*scaleX, ptY=gy-Vt*scaleY;
    ctx.save(); ctx.fillStyle=C.cyan; ctx.shadowColor=C.cyan; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(ptX,ptY,7,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  // Circuit diagram (right side)
  const cx2=W*0.75, cy2=H/2;
  const charge=Vt/V0;

  // Battery
  ctx.strokeStyle=C.border; ctx.lineWidth=1.5;
  ctx.strokeRect(cx2-20, cy2-35, 40, 70);
  glowText(ctx, `${V0}V`, cx2-12, cy2+48, C.amber, 9);
  glowText(ctx, 'SRC', cx2-10, cy2+6, C.text3, 9);

  // Resistor (top)
  ctx.strokeStyle=C.violet; ctx.lineWidth=2;
  for(let i=0;i<6;i++){
    ctx.beginPath();
    ctx.moveTo(cx2-30+i*10, cy2-55+(i%2===0?-6:6));
    ctx.lineTo(cx2-30+(i+1)*10, cy2-55+((i+1)%2===0?-6:6));
    ctx.stroke();
  }
  glowText(ctx, `${R_k}k\u03a9`, cx2+30, cy2-52, C.violet, 9);

  // Capacitor plates (right)
  const plateSep=10+charge*14;
  ctx.save(); ctx.strokeStyle=C.green; ctx.lineWidth=3; ctx.shadowColor=C.green; ctx.shadowBlur=charge*12;
  ctx.beginPath(); ctx.moveTo(cx2+48,cy2-20); ctx.lineTo(cx2+48,cy2+20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx2+48+plateSep,cy2-20); ctx.lineTo(cx2+48+plateSep,cy2+20); ctx.stroke();
  ctx.restore();
  glowText(ctx, `${C_uf}\u00b5F`, cx2+54, cy2+32, C.green, 9);

  // Charge indicator
  glowText(ctx, `${(charge*100).toFixed(1)}%`, cx2+52, cy2+4, C.cyan, 11);

  // Readings
  glowText(ctx, `V(t) = ${Vt.toFixed(3)} V`, 12, H-34, C.cyan, 10);
  glowText(ctx, `I(t) = ${It.toFixed(3)} mA`, 12, H-18, C.red, 10);
  glowText(ctx, `\u03c4 = ${tau.toFixed(3)} s`, 160, H-18, C.violet, 10);
}

// ─── PHOTOELECTRIC EFFECT ─────────────────────────────────────────────────
function drawPhotoelectric(ctx, W, H, p) {
  const f_PHz=p.peFreq||1.0; // petahertz
  const phi_eV=p.peMetal||4.5; // work function
  const h=4.136e-15; // eV·s
  const E_photon=h*f_PHz*1e15; // eV
  const KE=Math.max(0, E_photon-phi_eV);
  const ejected=E_photon>phi_eV;

  // Metal plate (left)
  const mX=80, mW=120, mY=H*0.2, mH=H*0.6;
  ctx.fillStyle='#f0ebff'; ctx.strokeStyle=C.border; ctx.lineWidth=1.5;
  ctx.fillRect(mX,mY,mW,mH); ctx.strokeRect(mX,mY,mW,mH);

  // Metal sheen lines
  for(let i=0;i<8;i++){
    ctx.strokeStyle='rgba(100,180,255,0.05)';
    ctx.beginPath(); ctx.moveTo(mX,mY+i*(mH/8)); ctx.lineTo(mX+mW,mY+i*(mH/8)); ctx.stroke();
  }
  glowText(ctx, 'Metal', mX+36, mY+mH/2, C.text3, 11);
  glowText(ctx, `\u03c6=${phi_eV}eV`, mX+26, mY+mH/2+18, C.violet, 10);

  // Photons (incoming from left)
  const photonCount=5;
  for(let i=0;i<photonCount;i++){
    const py=mY+mH*0.2+i*(mH*0.6/photonCount);
    const freq_color = f_PHz<0.8 ? C.red : f_PHz<1.5 ? C.amber : f_PHz<2.0 ? C.green : C.cyan;
    ctx.save(); ctx.strokeStyle=freq_color; ctx.lineWidth=1.5; ctx.shadowColor=freq_color; ctx.shadowBlur=6;
    // Wavy photon
    ctx.beginPath();
    for(let x=10;x<=mX-4;x+=2){
      const y=py+6*Math.sin((x)*0.4);
      x===10? ctx.moveTo(x,y): ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.restore();
    // Arrow tip
    ctx.fillStyle=freq_color;
    ctx.beginPath(); ctx.moveTo(mX-4,py-5); ctx.lineTo(mX+2,py); ctx.lineTo(mX-4,py+5); ctx.fill();
  }

  // Energy level label
  glowText(ctx, `E\u209a\u210f\u1d52\u209c\u1d52\u2099 = ${E_photon.toFixed(3)} eV`, 10, H-36, C.amber, 10);
  glowText(ctx, `Freq = ${f_PHz} PHz`, 10, H-20, C.cyan, 10);

  if (ejected) {
    // Electrons flying out
    for(let i=0;i<4;i++){
      const ey=mY+mH*0.2+i*(mH*0.6/4)+10;
      const ex=mX+mW+(i*30)%80+20;
      ctx.save(); ctx.fillStyle=C.green; ctx.shadowColor=C.green; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(mX+mW+20+i*22, ey, 6, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Velocity arrow
      ctx.save(); ctx.strokeStyle=C.green; ctx.lineWidth=1.5; ctx.shadowColor=C.green; ctx.shadowBlur=4;
      ctx.beginPath(); ctx.moveTo(mX+mW+26+i*22, ey); ctx.lineTo(mX+mW+50+i*22, ey-(i+1)*8); ctx.stroke();
      ctx.restore();
    }
    glowText(ctx, `KE\u2098\u2090\u02e3 = ${KE.toFixed(3)} eV`, W/2, H-36, C.green, 11);
    glowText(ctx, 'Electrons ejected!', W/2, H-20, C.green, 11);
  } else {
    // Electrons absorbed, nothing ejected
    ctx.save(); ctx.strokeStyle=C.red; ctx.lineWidth=2; ctx.shadowColor=C.red; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(W/2-16, H/2-10); ctx.lineTo(W/2+16, H/2+10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+16, H/2-10); ctx.lineTo(W/2-16, H/2+10); ctx.stroke();
    ctx.restore();
    glowText(ctx, 'No electrons ejected', W/2-50, H-20, C.red, 11);
    glowText(ctx, `Need f > ${(phi_eV/h/1e15).toFixed(2)} PHz`, W/2-60, H-36, C.text2, 10);
  }

  // Energy diagram (right)
  const dx=W-170, dy=H*0.15, dH=H*0.7;
  const scale=dH/7; // eV scale

  // Energy levels
  ctx.strokeStyle=C.border; ctx.lineWidth=0.75;
  ctx.beginPath(); ctx.moveTo(dx,dy+dH); ctx.lineTo(dx+120,dy+dH); ctx.stroke();
  glowText(ctx, '0 eV (free)', dx+4, dy+dH+10, C.text3, 8);

  const phiY=dy+dH-phi_eV*scale;
  ctx.strokeStyle='rgba(167,139,250,0.4)'; ctx.lineWidth=0.75; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(dx,phiY); ctx.lineTo(dx+120,phiY); ctx.stroke();
  ctx.setLineDash([]);
  glowText(ctx, `\u03c6=${phi_eV}eV`, dx+4, phiY-3, C.violet, 8);

  // Photon energy bar
  const photonH=Math.min(E_photon*scale, dH);
  ctx.fillStyle=C.amberD||'rgba(255,184,77,0.2)';
  ctx.fillRect(dx+20, dy+dH-photonH, 30, photonH);
  ctx.strokeStyle=C.amber; ctx.lineWidth=1;
  ctx.strokeRect(dx+20, dy+dH-photonH, 30, photonH);
  glowText(ctx, `${E_photon.toFixed(2)}eV`, dx+18, dy+dH-photonH-4, C.amber, 8);

  // KE bar
  if(ejected && KE>0){
    ctx.fillStyle='rgba(46,216,160,0.2)';
    ctx.fillRect(dx+60, dy+dH-KE*scale, 30, KE*scale);
    ctx.strokeStyle=C.green; ctx.lineWidth=1;
    ctx.strokeRect(dx+60, dy+dH-KE*scale, 30, KE*scale);
    glowText(ctx, `KE=${KE.toFixed(2)}`, dx+56, dy+dH-KE*scale-4, C.green, 8);
  }
}

// ─── Readings Calculator ───────────────────────────────────────────────────
function getReadings(expKey, p) {
  const g=9.8, R=8.314;
  switch(expKey) {
    case 'pendulum': {
      const L=p.pLen||1, m=p.pMass||0.5;
      const T=2*Math.PI*Math.sqrt(L/g);
      const PE=m*g*L*(1-Math.cos(pendState.theta));
      return [
        ['Period T',   `${T.toFixed(3)} s`],
        ['Frequency',  `${(1/T).toFixed(3)} Hz`],
        ['Angle \u03b8',     `${(pendState.theta*180/Math.PI).toFixed(2)}\u00b0`],
        ['\u03c9',          `${pendState.omega.toFixed(4)} rad/s`],
        ['Pot. Energy', `${PE.toFixed(4)} J`],
      ];
    }
    case 'projectile': {
      const v=p.pjVel||25, a=(p.pjAngle||45)*Math.PI/180, gv=p.pjGrav||9.8;
      return [
        ['Max Height', `${(v**2*Math.sin(a)**2/(2*gv)).toFixed(2)} m`],
        ['Range',      `${(v**2*Math.sin(2*a)/gv).toFixed(2)} m`],
        ['Flight Time',`${(2*v*Math.sin(a)/gv).toFixed(2)} s`],
        ['v\u2093 (const)', `${(v*Math.cos(a)).toFixed(2)} m/s`],
        ['v\u1d67\u2080',      `${(v*Math.sin(a)).toFixed(2)} m/s`],
      ];
    }
    case 'spring': {
      const k=p.spK||5, m=p.spM||0.5, A=p.spA||0.1;
      const omega=Math.sqrt(k/m), x=A*Math.cos(omega*springState.t);
      return [
        ['\u03c9',       `${omega.toFixed(3)} rad/s`],
        ['Period T', `${(2*Math.PI/omega).toFixed(3)} s`],
        ['Pos. x',   `${x.toFixed(4)} m`],
        ['KE',       `${(0.5*m*(omega*x)**2).toFixed(4)} J`],
        ['PE',       `${(0.5*k*x**2).toFixed(4)} J`],
      ];
    }
    case 'vibgyor': {
      return [
        ['Violet \u03bb', '380\u2013450 nm'],
        ['Blue \u03bb',   '450\u2013490 nm'],
        ['Green \u03bb',  '490\u2013565 nm'],
        ['Yellow \u03bb', '565\u2013590 nm'],
        ['Red \u03bb',    '625\u2013700 nm'],
      ];
    }
    case 'snell': {
      const n1=p.opN1||1, n2=p.opN2||1.5, th1=(p.opAngle||45)*Math.PI/180;
      const s2=(n1/n2)*Math.sin(th1);
      const th2=Math.abs(s2)<=1?(Math.asin(s2)*180/Math.PI).toFixed(2)+'\u00b0':'TIR!';
      return [
        ['\u03b8\u2081 (incident)', `${(p.opAngle||45)}\u00b0`],
        ['\u03b8\u2082 (refracted)', th2],
        ['n\u2081', (p.opN1||1).toFixed(2)],
        ['n\u2082', (p.opN2||1.5).toFixed(2)],
        ['Critical \u03b8', n1>=n2?(Math.asin(n2/n1)*180/Math.PI).toFixed(1)+'\u00b0':'N/A'],
      ];
    }
    case 'wave': {
      const f=p.wFreq||1.5;
      return [
        ['Frequency', `${f.toFixed(1)} Hz`],
        ['Period',    `${(1/f).toFixed(2)} s`],
        ['Phase diff',`${p.wPhase||0}\u00b0`],
        ['Source sep',`${p.wSep||1.5} m`],
      ];
    }
    case 'boyle': {
      const V=p.blV||10, T_=p.blTemp||300, n=p.blMol||0.5;
      const P=(n*R*T_)/V/1000;
      return [
        ['Pressure',   `${P.toFixed(3)} kPa`],
        ['Volume',     `${V.toFixed(1)} L`],
        ['Temperature',`${T_} K`],
        ['PV',         `${(P*V).toFixed(2)} kPa\u00b7L`],
        ['n (moles)',  `${n.toFixed(1)}`],
      ];
    }
    case 'capacitor': {
      const C_uf=p.capC||100, R_k=p.capR||10, V0=p.capV||12;
      const tau=(C_uf*1e-6)*(R_k*1e3);
      const Vt=V0*(1-Math.exp(-capState.t/tau));
      const It=(V0/(R_k*1e3))*Math.exp(-capState.t/tau)*1000;
      return [
        ['V(t)',     `${Vt.toFixed(3)} V`],
        ['I(t)',     `${It.toFixed(3)} mA`],
        ['\u03c4 = RC',   `${tau.toFixed(3)} s`],
        ['Charged%', `${(Vt/V0*100).toFixed(1)}%`],
        ['Energy',   `${(0.5*C_uf*1e-6*Vt**2).toFixed(6)} J`],
      ];
    }
    case 'photoelectric': {
      const h=4.136e-15;
      const E=(h*( p.peFreq||1)*1e15).toFixed(3);
      const KE=Math.max(0,(parseFloat(E)-(p.peMetal||4.5))).toFixed(3);
      const fc=((p.peMetal||4.5)/h/1e15).toFixed(3);
      return [
        ['Photon E',  `${E} eV`],
        ['Work fn \u03c6', `${p.peMetal||4.5} eV`],
        ['KE\u2098\u2090\u02e3',   `${KE} eV`],
        ['Threshold f', `${fc} PHz`],
        ['Ejected?',  parseFloat(E)>(p.peMetal||4.5)?'YES':'NO'],
      ];
    }
    default: return [];
  }
}
