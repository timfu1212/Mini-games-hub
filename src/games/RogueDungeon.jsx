import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   ROGUE DUNGEON  —  Canvas-rendered map + SVG sprite characters
   ═══════════════════════════════════════════════════════════════ */

const TILE = 40;
const MAP_W = 24, MAP_H = 16;
const VIEW_W = 18, VIEW_H = 13;
const T = { WALL:0, FLOOR:1, STAIRS:2, CHEST:3, TRAP:4, SHRINE:5, PILLAR:6, WATER:7 };

/* ─── SVG Sprites ────────────────────────────────────────────── */

const HeroSprite = ({ size = TILE, walking = false, shielded = false }) => {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={{ overflow: "visible", filter: `drop-shadow(0 ${Math.round(s*0.1)}px ${Math.round(s*0.15)}px rgba(0,0,0,0.9)) drop-shadow(0 0 ${Math.round(s*0.25)}px rgba(80,200,255,0.45))` }}>
      <ellipse cx="20" cy="37" rx="8" ry="2.5" fill="rgba(0,0,0,0.55)" />
      {/* Cape */}
      <path d="M14,22 Q12,32 13,36 Q20,38 27,36 Q28,32 26,22 Z" fill="#1a0a3a" stroke="#2a1055" strokeWidth="0.6" />
      <path d="M14,22 Q16,28 20,30 Q24,28 26,22" fill="#260d50" />
      {/* Body armor */}
      <rect x="14" y="18" width="12" height="12" rx="2" fill="#1e3a5f" stroke="#2a5a8f" strokeWidth="0.8" />
      <rect x="15.5" y="19" width="9" height="3" rx="1" fill="#264a72" />
      {/* Shoulder pads */}
      <ellipse cx="13" cy="20" rx="3" ry="2.5" fill="#1a3354" stroke="#2a4f7a" strokeWidth="0.6"/>
      <ellipse cx="27" cy="20" rx="3" ry="2.5" fill="#1a3354" stroke="#2a4f7a" strokeWidth="0.6"/>
      {/* Chest rune */}
      <path d="M18,21 L20,19.5 L22,21 L20,22.5 Z" fill="none" stroke="rgba(100,200,255,0.7)" strokeWidth="0.7"/>
      {/* Arms */}
      <rect x="10" y="19" width="4" height="7" rx="2" fill="#1a3050" stroke="#254468" strokeWidth="0.6"/>
      <rect x="26" y="19" width="4" height="7" rx="2" fill="#1a3050" stroke="#254468" strokeWidth="0.6"/>
      <ellipse cx="12" cy="27" rx="2.2" ry="1.8" fill="#0d1f33"/>
      <ellipse cx="28" cy="27" rx="2.2" ry="1.8" fill="#0d1f33"/>
      {/* Sword */}
      <line x1="29" y1="18" x2="34" y2="9" stroke="#c0d8f0" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="28" y1="16" x2="32" y2="14" stroke="#8899aa" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="29.5" cy="18.5" r="1.3" fill="#667788" />
      {/* Head */}
      <ellipse cx="20" cy="14" rx="6" ry="6.5" fill="#e8c49a" stroke="#c8a478" strokeWidth="0.5" />
      {/* Helmet */}
      <path d="M14,13 Q14,7 20,7 Q26,7 26,13 L25,14 Q22,11 20,11 Q18,11 15,14 Z" fill="#1e3a5f" stroke="#2a5a8f" strokeWidth="0.7"/>
      <rect x="18" y="7" width="4" height="2.5" rx="0.8" fill="#2a5a8f" />
      {/* Visor glow */}
      <path d="M15.5,13 Q18,11.5 20,12 Q22,11.5 24.5,13" fill="none" stroke="rgba(100,220,255,0.9)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="17.5" cy="14.5" rx="1.2" ry="0.8" fill="rgba(0,200,255,0.95)"/>
      <ellipse cx="22.5" cy="14.5" rx="1.2" ry="0.8" fill="rgba(0,200,255,0.95)"/>
      {/* Helmet cheeks */}
      <path d="M14.5,13.5 L15,16 L14,16" fill="#182e4a" stroke="#2a4a6a" strokeWidth="0.4"/>
      <path d="M25.5,13.5 L25,16 L26,16" fill="#182e4a" stroke="#2a4a6a" strokeWidth="0.4"/>
      {/* Legs */}
      <rect x="16" y="29" width="4" height="7" rx="2" fill="#16284a" stroke="#1e3866" strokeWidth="0.5" transform={walking ? "translate(-0.5,-1)" : ""}/>
      <rect x="20.5" y="29" width="4" height="7" rx="2" fill="#16284a" stroke="#1e3866" strokeWidth="0.5" transform={walking ? "translate(0.5,1)" : ""}/>
      {/* Boots */}
      <ellipse cx="18" cy="36" rx="3.5" ry="1.8" fill="#0e1a2c"/>
      <ellipse cx="22.5" cy="36" rx="3.5" ry="1.8" fill="#0e1a2c"/>
      {/* Shield aura */}
      {shielded && <ellipse cx="20" cy="20" rx="16" ry="18" fill="none" stroke="rgba(140,80,255,0.45)" strokeWidth="1.5" strokeDasharray="3 3"/>}
    </svg>
  );
};

const EnemySprite = ({ spriteType, size = TILE, color = "#88aacc" }) => {
  const s = size;

  if (spriteType === "drone") return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={{ overflow:"visible", filter:`drop-shadow(0 4px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 8px ${color}88)` }}>
      <ellipse cx="20" cy="37" rx="7" ry="2" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="20" cy="22" rx="9" ry="7" fill="#1a2a3a" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="20" cy="21" rx="7" ry="5" fill="#0f1e2e" />
      <ellipse cx="20" cy="21" rx="4" ry="3.5" fill="#050e18"/>
      <ellipse cx="20" cy="21" rx="3" ry="2.5" fill={color} opacity="0.8"/>
      <ellipse cx="21" cy="20" rx="1" ry="1" fill="white" opacity="0.6"/>
      <line x1="14" y1="16" x2="10" y2="10" stroke={color} strokeWidth="0.8"/>
      <circle cx="10" cy="9.5" r="1.5" fill={color} opacity="0.9"/>
      <line x1="26" y1="16" x2="30" y2="10" stroke={color} strokeWidth="0.8"/>
      <circle cx="30" cy="9.5" r="1.5" fill={color} opacity="0.9"/>
      <ellipse cx="11" cy="18" rx="5" ry="1.5" fill={color} opacity="0.3" transform="rotate(-20 11 18)"/>
      <ellipse cx="29" cy="18" rx="5" ry="1.5" fill={color} opacity="0.3" transform="rotate(20 29 18)"/>
      <line x1="15" y1="27" x2="13" y2="33" stroke="#1a2a3a" strokeWidth="1.5"/>
      <line x1="20" y1="28" x2="20" y2="34" stroke="#1a2a3a" strokeWidth="1.5"/>
      <line x1="25" y1="27" x2="27" y2="33" stroke="#1a2a3a" strokeWidth="1.5"/>
    </svg>
  );

  if (spriteType === "glitch") return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={{ overflow:"visible", filter:`drop-shadow(0 4px 5px rgba(0,0,0,0.9)) drop-shadow(0 0 10px ${color}99)` }}>
      <ellipse cx="20" cy="37" rx="7" ry="2" fill="rgba(0,0,0,0.5)" />
      <rect x="11" y="14" width="18" height="18" rx="2" fill="#1a0a2e" stroke={color} strokeWidth="0.8"/>
      <rect x="11" y="14" width="18" height="4" rx="1" fill={color} opacity="0.2"/>
      <rect x="11" y="20" width="18" height="1.5" fill={color} opacity="0.15"/>
      <rect x="14" y="17" width="5" height="4" rx="1" fill={color} opacity="0.85"/>
      <rect x="21" y="17" width="5" height="4" rx="1" fill={color} opacity="0.85"/>
      <rect x="16" y="18.5" width="1.5" height="2" fill="#0a0010"/>
      <rect x="23" y="18.5" width="1.5" height="2" fill="#0a0010"/>
      <polyline points="15,26 17,24.5 19,26 21,24.5 23,26 25,24.5" fill="none" stroke={color} strokeWidth="1" opacity="0.7"/>
      <path d="M13,30 Q9,33 10,37" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M27,30 Q31,33 30,37" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
    </svg>
  );

  if (spriteType === "warden") return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={{ overflow:"visible", filter:`drop-shadow(0 4px 8px rgba(0,0,0,0.95)) drop-shadow(0 0 14px ${color}aa)` }}>
      <ellipse cx="20" cy="38" rx="10" ry="2.5" fill="rgba(0,0,0,0.6)" />
      <rect x="13" y="28" width="6" height="9" rx="2" fill="#1a1a2a" stroke="#2a2a3a" strokeWidth="0.7"/>
      <rect x="21" y="28" width="6" height="9" rx="2" fill="#1a1a2a" stroke="#2a2a3a" strokeWidth="0.7"/>
      <rect x="10" y="15" width="20" height="16" rx="3" fill="#222" stroke={color} strokeWidth="1"/>
      <rect x="10" y="15" width="20" height="5" rx="2" fill={color} opacity="0.2"/>
      <rect x="15" y="18" width="10" height="8" rx="1" fill="#1a1a22" stroke={color} strokeWidth="0.5" opacity="0.8"/>
      <path d="M17,20 L20,18 L23,20 L20,22 Z" fill="none" stroke={color} strokeWidth="0.8"/>
      <ellipse cx="8" cy="18" rx="4.5" ry="5" fill="#1e1e2e" stroke={color} strokeWidth="0.7"/>
      <ellipse cx="32" cy="18" rx="4.5" ry="5" fill="#1e1e2e" stroke={color} strokeWidth="0.7"/>
      <rect x="4" y="19" width="5" height="10" rx="2" fill="#1a1a28"/>
      <rect x="31" y="19" width="5" height="10" rx="2" fill="#1a1a28"/>
      <rect x="2" y="22" width="3" height="8" rx="1" fill="#444" stroke="#666" strokeWidth="0.5"/>
      <path d="M0,19 L4,22 L4,28 L0,30 Z" fill="#888" stroke="#aaa" strokeWidth="0.5"/>
      <path d="M10,15 Q10,7 20,7 Q30,7 30,15 Z" fill="#1a1a2e" stroke={color} strokeWidth="0.8"/>
      <rect x="14" y="7" width="12" height="3" rx="0.5" fill="#2a2a3e"/>
      <rect x="12" y="13" width="16" height="3" rx="1" fill={color} opacity="0.7"/>
      <rect x="13" y="13.5" width="14" height="2" rx="0.8" fill="black" opacity="0.5"/>
      <path d="M12,10 L8,4 L11,10" fill={color} opacity="0.6"/>
      <path d="M28,10 L32,4 L29,10" fill={color} opacity="0.6"/>
    </svg>
  );

  if (spriteType === "boss") return (
    <svg width={s * 1.5} height={s * 1.5} viewBox="0 0 60 60" style={{ overflow:"visible", filter:`drop-shadow(0 6px 12px rgba(0,0,0,0.98)) drop-shadow(0 0 22px ${color}cc)` }}>
      <ellipse cx="30" cy="57" rx="16" ry="3.5" fill="rgba(0,0,0,0.65)" />
      <path d="M12,30 Q8,50 10,58 Q30,62 50,58 Q52,50 48,30 Z" fill="#0a0015" stroke="#1a003a" strokeWidth="0.8"/>
      <ellipse cx="30" cy="28" rx="13" ry="14" fill="#110025" stroke={color} strokeWidth="1"/>
      <polygon points="30,20 34,26 30,32 26,26" fill={color} opacity="0.6"/>
      <polygon points="30,22 33,26 30,30 27,26" fill="white" opacity="0.3"/>
      <path d="M17,26 Q8,22 6,28 Q8,34 14,32" fill="#0e0022" stroke={color} strokeWidth="0.8"/>
      <path d="M43,26 Q52,22 54,28 Q52,34 46,32" fill="#0e0022" stroke={color} strokeWidth="0.8"/>
      <circle cx="7" cy="29" r="3.5" fill={color} opacity="0.7"/>
      <circle cx="7" cy="29" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="53" cy="29" r="3.5" fill={color} opacity="0.7"/>
      <circle cx="53" cy="29" r="1.5" fill="white" opacity="0.8"/>
      <ellipse cx="30" cy="14" rx="11" ry="13" fill="#f0eae0" stroke="#d0c8b8" strokeWidth="0.5"/>
      <path d="M19,10 L19,4 L22,7 L25,3 L28,7 L30,3 L32,7 L35,3 L38,7 L41,4 L41,10 Z" fill="#1a003a" stroke={color} strokeWidth="0.6"/>
      <circle cx="25" cy="4" r="1.5" fill={color} opacity="0.9"/>
      <circle cx="30" cy="3" r="1.8" fill={color}/>
      <circle cx="35" cy="4" r="1.5" fill={color} opacity="0.9"/>
      <ellipse cx="24.5" cy="14" rx="3.5" ry="4" fill="#0a0015"/>
      <ellipse cx="35.5" cy="14" rx="3.5" ry="4" fill="#0a0015"/>
      <ellipse cx="24.5" cy="14" rx="2" ry="2.5" fill={color} opacity="0.9"/>
      <ellipse cx="35.5" cy="14" rx="2" ry="2.5" fill={color} opacity="0.9"/>
      <ellipse cx="25" cy="13" rx="0.8" ry="1" fill="white" opacity="0.7"/>
      <ellipse cx="36" cy="13" rx="0.8" ry="1" fill="white" opacity="0.7"/>
      <path d="M28,18 L30,20 L32,18" fill="none" stroke="#c0b8a8" strokeWidth="0.6"/>
      <rect x="24" y="22" width="2" height="3" rx="0.5" fill="#d0c8b8"/>
      <rect x="27" y="22" width="2" height="3.5" rx="0.5" fill="#d0c8b8"/>
      <rect x="30" y="22" width="2" height="3" rx="0.5" fill="#d0c8b8"/>
      <rect x="33" y="22" width="2" height="3.5" rx="0.5" fill="#d0c8b8"/>
    </svg>
  );

  // specter / default
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={{ overflow:"visible", filter:`drop-shadow(0 4px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 10px ${color}88)` }}>
      <ellipse cx="20" cy="37" rx="6" ry="2" fill="rgba(0,0,0,0.4)" />
      <path d="M10,20 Q10,8 20,8 Q30,8 30,20 L30,34 Q27,32 24,34 Q22,32 20,34 Q18,32 16,34 Q13,32 10,34 Z" fill="#1a1a2e" stroke={color} strokeWidth="0.8" opacity="0.92"/>
      <path d="M13,20 Q13,12 20,12 Q27,12 27,20 L27,28" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4"/>
      <ellipse cx="15.5" cy="18" rx="3" ry="3.5" fill={color} opacity="0.9"/>
      <ellipse cx="24.5" cy="18" rx="3" ry="3.5" fill={color} opacity="0.9"/>
      <ellipse cx="15.5" cy="18" rx="1.5" ry="2" fill="black"/>
      <ellipse cx="24.5" cy="18" rx="1.5" ry="2" fill="black"/>
      <ellipse cx="16" cy="17" rx="0.7" ry="0.7" fill="white" opacity="0.7"/>
      <ellipse cx="25" cy="17" rx="0.7" ry="0.7" fill="white" opacity="0.7"/>
      <path d="M15,24 Q17.5,26.5 20,24 Q22.5,26.5 25,24" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6"/>
    </svg>
  );
};

/* ─── Canvas tile drawing ────────────────────────────────────── */
function drawTile(ctx, type, tx, ty, size, li, torchLight) {
  const x = tx * size, y = ty * size, s = size;
  ctx.save();
  const tl = Math.min(1, li + torchLight * 0.6);

  if (type === T.WALL) {
    const br = Math.floor(18 + tl * 20), bg = Math.floor(26 + tl * 22), bb = Math.floor(40 + tl * 26);
    ctx.fillStyle = `rgb(${br},${bg},${bb})`;
    ctx.fillRect(x, y, s, s);
    // Brick rows
    const row2 = Math.floor((tx + ty) % 2);
    ctx.fillStyle = `rgba(${br+8},${bg+9},${bb+12},0.45)`;
    if (row2 === 0) {
      ctx.fillRect(x+1, y+1, s*0.52-1, s*0.48-1);
      ctx.fillRect(x+s*0.52, y+1, s*0.48-2, s*0.48-1);
      ctx.fillRect(x+1, y+s*0.51, s*0.26, s*0.46);
      ctx.fillRect(x+s*0.28, y+s*0.51, s*0.7-2, s*0.46);
    } else {
      ctx.fillRect(x+1, y+1, s*0.36-1, s*0.48-1);
      ctx.fillRect(x+s*0.37, y+1, s*0.6-1, s*0.48-1);
      ctx.fillRect(x+1, y+s*0.51, s*0.62, s*0.46);
      ctx.fillRect(x+s*0.63, y+s*0.51, s*0.35-2, s*0.46);
    }
    // Grout
    ctx.strokeStyle = `rgba(0,8,22,0.65)`; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y+s*0.5); ctx.lineTo(x+s, y+s*0.5);
    if (row2===0){ctx.moveTo(x+s*0.52,y);ctx.lineTo(x+s*0.52,y+s*0.5);ctx.moveTo(x+s*0.28,y+s*0.5);ctx.lineTo(x+s*0.28,y+s);}
    else{ctx.moveTo(x+s*0.37,y);ctx.lineTo(x+s*0.37,y+s*0.5);ctx.moveTo(x+s*0.63,y+s*0.5);ctx.lineTo(x+s*0.63,y+s);}
    ctx.stroke();
    // 3D bevel
    const g = ctx.createLinearGradient(x,y,x+s,y+s);
    g.addColorStop(0,`rgba(100,160,220,${0.18*tl})`); g.addColorStop(0.5,"rgba(0,0,0,0)"); g.addColorStop(1,`rgba(0,0,0,${0.35*(1-tl*0.5)})`);
    ctx.fillStyle=g; ctx.fillRect(x,y,s,s);
    ctx.fillStyle=`rgba(110,170,230,${0.2*tl})`; ctx.fillRect(x,y,s,2); ctx.fillRect(x,y,2,s);
    ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(x,y+s-2,s,2); ctx.fillRect(x+s-2,y,2,s);
    // Noise dots
    if (tl > 0.3) {
      ctx.fillStyle=`rgba(${br+18},${bg+20},${bb+25},0.28)`;
      for (let d=0;d<4;d++){ctx.fillRect(x+((tx*31+ty*17+d*7)%(s-6))+3,y+((tx*19+ty*23+d*11)%(s-6))+3,1.5,1.5);}
    }

  } else if (type === T.PILLAR) {
    const fr=Math.floor(10+li*10),fg=Math.floor(17+li*13),fb=Math.floor(28+li*16);
    ctx.fillStyle=`rgb(${fr},${fg},${fb})`; ctx.fillRect(x,y,s,s);
    const pg=ctx.createRadialGradient(x+s*0.35,y+s*0.3,1,x+s/2,y+s/2,s*0.42);
    pg.addColorStop(0,`rgba(80,140,200,${0.5*tl})`); pg.addColorStop(0.5,`rgba(25,55,100,${0.9*tl+0.1})`); pg.addColorStop(1,`rgba(5,15,30,1)`);
    ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s*0.42,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(60,120,180,${0.3*tl})`; ctx.lineWidth=0.8;
    ctx.beginPath();ctx.arc(x+s/2,y+s/2,s*0.38,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(x+s/2,y+s/2,s*0.26,0,Math.PI*2);ctx.stroke();
    const sg=ctx.createRadialGradient(x+s*0.5,y+s*0.85,0,x+s*0.5,y+s*0.85,s*0.35);
    sg.addColorStop(0,"rgba(0,0,0,0.5)");sg.addColorStop(1,"transparent");
    ctx.fillStyle=sg;ctx.fillRect(x,y+s*0.6,s,s*0.4);

  } else {
    // Floor
    const fr=Math.floor(10+tl*12+torchLight*16),fg=Math.floor(17+tl*14+torchLight*9),fb=Math.floor(28+tl*20+torchLight*4);
    ctx.fillStyle=`rgb(${fr},${fg},${fb})`; ctx.fillRect(x,y,s,s);
    const fg2=ctx.createLinearGradient(x,y,x+s,y+s);
    fg2.addColorStop(0,`rgba(${fr+7},${fg+9},${fb+12},0.4)`); fg2.addColorStop(1,"rgba(0,0,0,0.18)");
    ctx.fillStyle=fg2; ctx.fillRect(x,y,s,s);
    ctx.strokeStyle=`rgba(0,25,60,${0.1+tl*0.07})`; ctx.lineWidth=0.6;
    ctx.strokeRect(x+1,y+1,s-2,s-2);
    ctx.strokeStyle=`rgba(${fr+18},${fg+20},${fb+26},${0.07*tl})`; ctx.strokeRect(x+3,y+3,s-6,s-6);

    if (type===T.WATER) {
      ctx.fillStyle="rgba(8,38,95,0.62)"; ctx.fillRect(x,y,s,s);
      const wg=ctx.createLinearGradient(x,y,x+s,y+s);
      wg.addColorStop(0,"rgba(18,75,170,0.32)");wg.addColorStop(1,"rgba(5,28,110,0.28)");
      ctx.fillStyle=wg;ctx.fillRect(x,y,s,s);
    }
    if (type===T.STAIRS) {
      const sg2=ctx.createRadialGradient(x+s/2,y+s/2,2,x+s/2,y+s/2,s*0.48);
      sg2.addColorStop(0,"rgba(0,200,255,0.4)");sg2.addColorStop(0.6,"rgba(0,100,180,0.12)");sg2.addColorStop(1,"transparent");
      ctx.fillStyle=sg2;ctx.fillRect(x,y,s,s);
      ctx.strokeStyle="rgba(0,200,255,0.65)";ctx.lineWidth=1.2;
      for(let i=0;i<3;i++){const ins=4+i*4;ctx.strokeRect(x+ins,y+ins,s-ins*2,s-ins*2);}
      ctx.fillStyle="rgba(0,200,255,0.6)";ctx.font=`bold ${Math.floor(s*0.44)}px monospace`;
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("▼",x+s/2,y+s/2+1);
    }
    if (type===T.CHEST) {
      ctx.fillStyle="#4a2800";ctx.fillRect(x+7,y+14,s-14,s-18);
      ctx.fillStyle="#6a3c00";ctx.fillRect(x+7,y+14,s-14,6);
      ctx.fillStyle="#8B5000";ctx.fillRect(x+7,y+14,s-14,3);
      ctx.strokeStyle="#c8a000";ctx.lineWidth=1;ctx.strokeRect(x+7,y+14,s-14,s-18);
      ctx.beginPath();ctx.moveTo(x+s/2,y+14);ctx.lineTo(x+s/2,y+s-5);ctx.stroke();
      ctx.fillStyle="#c8a000";ctx.beginPath();ctx.arc(x+s/2,y+22,2,0,Math.PI*2);ctx.fill();ctx.fillRect(x+s/2-1,y+22,2,3);
      const cg=ctx.createRadialGradient(x+s/2,y+s/2,0,x+s/2,y+s/2,s/2);
      cg.addColorStop(0,"rgba(255,200,0,0.14)");cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg;ctx.fillRect(x,y,s,s);
    }
    if (type===T.TRAP) {
      ctx.fillStyle="rgba(70,15,0,0.48)";ctx.fillRect(x+2,y+2,s-4,s-4);
      ctx.fillStyle="#993300";
      for(let sp=0;sp<5;sp++){const sx=x+4+sp*6.5;ctx.beginPath();ctx.moveTo(sx,y+s-5);ctx.lineTo(sx+2.5,y+9);ctx.lineTo(sx+5,y+s-5);ctx.closePath();ctx.fill();}
      ctx.fillStyle="rgba(255,60,0,0.22)";ctx.fillRect(x,y,s,s);
    }
    if (type===T.SHRINE) {
      const shrg=ctx.createRadialGradient(x+s/2,y+s/2,0,x+s/2,y+s/2,s*0.5);
      shrg.addColorStop(0,"rgba(180,80,255,0.3)");shrg.addColorStop(0.7,"rgba(90,40,180,0.1)");shrg.addColorStop(1,"transparent");
      ctx.fillStyle=shrg;ctx.fillRect(x,y,s,s);
      ctx.fillStyle="#2a1540";ctx.fillRect(x+9,y+17,s-18,s-21);ctx.fillRect(x+7,y+23,s-14,3);
      ctx.strokeStyle="rgba(200,100,255,0.75)";ctx.lineWidth=0.9;
      const cx2=x+s/2,cy2=y+19;
      ctx.beginPath();ctx.moveTo(cx2,cy2-5);ctx.lineTo(cx2+4,cy2+3);ctx.lineTo(cx2-4,cy2+3);ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx2,cy2+5);ctx.lineTo(cx2+4,cy2-3);ctx.lineTo(cx2-4,cy2-3);ctx.closePath();ctx.stroke();
    }
  }
  ctx.restore();
}

/* ─── Map Generator ─────────────────────────────────────────── */
function genMap(floor) {
  const map = Array(MAP_H).fill(0).map(() => Array(MAP_W).fill(T.WALL));
  const rooms = [];
  const tryRoom = () => {
    const w=4+Math.floor(Math.random()*5), h=3+Math.floor(Math.random()*4);
    const x=1+Math.floor(Math.random()*(MAP_W-w-2)), y=1+Math.floor(Math.random()*(MAP_H-h-2));
    if (rooms.some(r=>x<r.x+r.w+1&&x+w>r.x-1&&y<r.y+r.h+1&&y+h>r.y-1)) return null;
    return {x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};
  };
  for(let i=0;i<28;i++){const r=tryRoom();if(r){rooms.push(r);for(let ry=r.y;ry<r.y+r.h;ry++)for(let rx=r.x;rx<r.x+r.w;rx++)map[ry][rx]=T.FLOOR;}}
  for(let i=1;i<rooms.length;i++){
    let{cx:ax,cy:ay}=rooms[i-1],{cx:bx,cy:by}=rooms[i];
    while(ax!==bx){map[ay][ax]=T.FLOOR;ax+=ax<bx?1:-1;}
    while(ay!==by){map[ay][ax]=T.FLOOR;ay+=ay<by?1:-1;}
  }
  rooms.forEach(r=>{if(r.w>=5&&r.h>=4&&Math.random()<0.4){map[r.y+1][r.x+1]=T.PILLAR;if(r.w>=6)map[r.y+1][r.x+r.w-2]=T.PILLAR;}});
  rooms.slice(2,-1).forEach(r=>{if(Math.random()<0.22){const wx=r.x+1+Math.floor(Math.random()*(r.w-2)),wy=r.y+1+Math.floor(Math.random()*(r.h-2));map[wy][wx]=T.WATER;}});
  const last=rooms[rooms.length-1];
  map[last.cy][last.cx]=T.STAIRS;
  rooms.slice(1,-1).forEach((r,i)=>{
    if(i%2===0)map[r.y+1][r.x+1]=T.CHEST;
    if(i%3===0&&floor>1)map[r.cy][r.cx]=Math.random()<0.4?T.TRAP:T.SHRINE;
  });
  const torches=[];
  rooms.forEach(r=>{torches.push({x:r.x+1,y:r.y},{x:r.x+r.w-2,y:r.y+r.h-1});});
  return {map,rooms,start:rooms[0],torches};
}

const ENEMY_POOL = [
  {name:"Drone",   spriteType:"drone",   baseHp:30, baseAtk:8,  baseXp:15, color:"#88aacc", ai:"chase"},
  {name:"Glitch",  spriteType:"glitch",  baseHp:20, baseAtk:12, baseXp:20, color:"#cc88ff", ai:"erratic"},
  {name:"Specter", spriteType:"specter", baseHp:50, baseAtk:18, baseXp:35, color:"#44aaff", ai:"erratic"},
  {name:"Warden",  spriteType:"warden",  baseHp:120,baseAtk:28, baseXp:100,color:"#ff8800", ai:"chase"},
  {name:"BOSS",    spriteType:"boss",    baseHp:350,baseAtk:45, baseXp:500,color:"#ff2244", ai:"boss"},
];

function spawnEnemies(rooms,floor){
  const pool=ENEMY_POOL.slice(0,Math.min(4,1+Math.floor(floor/1.5)));
  const enemies=[];
  if(floor%5===0){const boss=ENEMY_POOL[4],r=rooms[rooms.length-1];enemies.push({id:Math.random(),...boss,hp:boss.baseHp+floor*20,maxHp:boss.baseHp+floor*20,atk:boss.baseAtk+floor*3,xp:boss.baseXp+floor*50,x:r.cx,y:r.cy,alive:true});}
  rooms.slice(1).forEach(room=>{
    const count=1+Math.floor(Math.random()*2)+Math.floor(floor/3);
    for(let i=0;i<count;i++){
      const e=pool[Math.floor(Math.random()*pool.length)];
      enemies.push({id:Math.random(),...e,hp:e.baseHp+floor*8,maxHp:e.baseHp+floor*8,atk:e.baseAtk+floor*2,xp:e.baseXp+floor*8,x:room.x+1+Math.floor(Math.random()*(room.w-2)),y:room.y+1+Math.floor(Math.random()*(room.h-2)),alive:true});
    }
  });
  return enemies;
}

const SPELLS=[
  {id:"fireball",name:"Fireball",emoji:"🔥",manaCost:25,dmg:55,aoe:3,color:"#ff5500"},
  {id:"lightning",name:"Lightning",emoji:"⚡",manaCost:20,dmg:45,aoe:0,color:"#ffee00"},
  {id:"heal",name:"Heal Aura",emoji:"💚",manaCost:30,dmg:0,aoe:0,color:"#00ff88"},
  {id:"shield",name:"Arcane Shield",emoji:"🔮",manaCost:35,dmg:0,aoe:0,color:"#aa88ff"},
];
const ITEMS=[
  {id:"medpack",name:"Med Pack",emoji:"💊",rarity:"common",type:"heal",value:30,desc:"Restore 30 HP"},
  {id:"stimpack",name:"Stim Pack",emoji:"💉",rarity:"uncommon",type:"heal",value:60,desc:"Restore 60 HP"},
  {id:"plasma",name:"Plasma Blade",emoji:"⚡",rarity:"uncommon",type:"weapon",value:8,desc:"+8 ATK"},
  {id:"xblade",name:"Void Blade",emoji:"🗡️",rarity:"rare",type:"weapon",value:16,desc:"+16 ATK"},
  {id:"nanosuit",name:"Nano Armor",emoji:"🛡️",rarity:"uncommon",type:"armor",value:6,desc:"+6 DEF"},
  {id:"grenade",name:"Frag Grenade",emoji:"💣",rarity:"common",type:"active",value:80,desc:"80 AOE DMG",uses:2},
  {id:"battery",name:"Power Cell",emoji:"🔋",rarity:"common",type:"passive",value:15,desc:"+15 Max HP"},
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Share+Tech+Mono&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes enemyBob  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-3px) scale(1.03)} }
  @keyframes shake     { 0%,100%{transform:translate(0)} 15%{transform:translate(-5px,3px)} 35%{transform:translate(5px,-3px)} 55%{transform:translate(-3px,5px)} 80%{transform:translate(4px,-2px)} }
  @keyframes floatUp   { 0%{opacity:1;transform:translateY(0) translateX(-50%) scale(1.1)} 100%{opacity:0;transform:translateY(-55px) translateX(-50%) scale(0.7)} }
  @keyframes glowPulse { 0%,100%{opacity:0.7;filter:brightness(1)} 50%{opacity:1;filter:brightness(1.5)} }
  @keyframes scanline  { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
  @keyframes appear    { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @keyframes screenFl  { 0%{background:rgba(255,50,40,0.26)} 100%{background:transparent} }
  @keyframes castRing  { 0%{transform:scale(0.3) translate(-50%,-50%);opacity:1} 100%{transform:scale(4) translate(-50%,-50%);opacity:0} }
  @keyframes hpBlink   { 0%,100%{color:#ff4422} 50%{color:#ffaa00} }
  @keyframes waterShim { 0%,100%{opacity:0.5} 50%{opacity:0.85} }
  ::-webkit-scrollbar { width:3px }
  ::-webkit-scrollbar-track { background:#030810 }
  ::-webkit-scrollbar-thumb { background:rgba(180,130,60,0.3); border-radius:2px }
`;

/* ─── Main Component ──────────────────────────────────────────── */
export default function RogueDungeon({onScore}) {
  const [TILE, setTILE] = useState(40);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const tw = Math.floor((vw - 218) / VIEW_W);
      const th = Math.floor((vh - 128) / VIEW_H);
      setTILE(Math.max(24, Math.min(46, Math.min(tw, th))));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const initPlayer = () => ({
    x:3,y:3,hp:140,maxHp:140,mana:80,maxMana:80,
    atk:14,def:2,xp:0,xpNext:40,level:1,floor:1,score:0,gold:0,
    inventory:[],spells:SPELLS.slice(0,3),tempDef:0,tempDefTurns:0,
    log:["⚔ The dungeon breathes...","WASD / Arrows — Move","Q Attack · E Spell · F Item"],
  });

  const [phase, setPhase] = useState("idle");
  const [player, setPlayer] = useState(initPlayer);
  const [mapData, setMapData] = useState(null);
  const [torches, setTorches] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [camX, setCamX] = useState(0);
  const [camY, setCamY] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [castEffect, setCastEffect] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState(0);
  const [inspecting, setInspecting] = useState(null);
  const [walking, setWalking] = useState(false);

  const enemiesRef = useRef([]);
  const mapRef = useRef(null);
  const revealedRef = useRef(new Set());
  const playerRef = useRef(null);
  const camRef = useRef({x:0,y:0});
  const torchesRef = useRef([]);

  enemiesRef.current = enemies;
  mapRef.current = mapData;
  playerRef.current = player;
  camRef.current = {x:camX,y:camY};
  torchesRef.current = torches;

  /* Canvas render loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = (time) => {
      const p = playerRef.current;
      const map = mapRef.current;
      const rev = revealedRef.current;
      const {x:cx,y:cy} = camRef.current;
      const tArr = torchesRef.current;

      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#010306";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      if (!map || !p) { animFrameRef.current = requestAnimationFrame(render); return; }

      for (let ry=cy; ry<cy+VIEW_H; ry++) for (let rx=cx; rx<cx+VIEW_W; rx++) {
        const key = `${rx},${ry}`;
        if (!rev.has(key)) { ctx.fillStyle="#010306"; ctx.fillRect((rx-cx)*TILE,(ry-cy)*TILE,TILE,TILE); continue; }
        const tile = map[ry]?.[rx] ?? T.WALL;
        const dx=rx-p.x, dy=ry-p.y, dist=Math.sqrt(dx*dx+dy*dy);
        const isVis = dist <= 5.5;
        const li = isVis ? Math.max(0,1-dist/6) : 0;
        const nearTorch = tArr.some(t=>Math.abs(t.x-rx)<=2.5&&Math.abs(t.y-ry)<=2.5&&rev.has(`${t.x},${t.y}`));
        const torchWave = nearTorch ? (0.55 + Math.sin(time/420+(rx+ry)*0.7)*0.22) : 0;
        ctx.globalAlpha = isVis ? 1 : 0.28;
        drawTile(ctx, tile, rx-cx, ry-cy, TILE, li, torchWave*0.48);
        ctx.globalAlpha = 1;
      }

      // Torch glows
      tArr.forEach(t => {
        if (!rev.has(`${t.x},${t.y}`)) return;
        const d2 = Math.abs(t.x-p.x)+Math.abs(t.y-p.y);
        if (d2>9) return;
        const lx=(t.x-cx)*TILE+TILE/2, ly=(t.y-cy)*TILE+TILE*0.3;
        if (lx<-TILE||lx>VIEW_W*TILE+TILE||ly<-TILE||ly>VIEW_H*TILE+TILE) return;
        const wave = 0.55+Math.sin(time/350+t.x*1.2+t.y*0.8)*0.22;
        const tg = ctx.createRadialGradient(lx,ly,0,lx,ly,TILE*2.3);
        tg.addColorStop(0,`rgba(255,155,55,${0.2*wave})`);
        tg.addColorStop(0.4,`rgba(210,90,15,${0.09*wave})`);
        tg.addColorStop(1,"transparent");
        ctx.fillStyle = tg; ctx.fillRect(lx-TILE*2.3,ly-TILE*2.3,TILE*4.6,TILE*4.6);
        // Torch dot
        ctx.fillStyle=`rgba(255,195,75,${wave*0.88})`; ctx.beginPath();ctx.arc(lx,ly,2.8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(255,240,190,${wave*0.6})`; ctx.beginPath();ctx.arc(lx,ly,1.3,0,Math.PI*2);ctx.fill();
      });

      // Player ambient light
      const plx=(p.x-cx)*TILE+TILE/2, ply=(p.y-cy)*TILE+TILE/2;
      const pg = ctx.createRadialGradient(plx,ply,0,plx,ply,TILE*3.5);
      pg.addColorStop(0,"rgba(40,130,255,0.1)"); pg.addColorStop(0.5,"rgba(0,70,190,0.04)"); pg.addColorStop(1,"transparent");
      ctx.fillStyle=pg; ctx.fillRect(0,0,canvas.width,canvas.height);

      // Water shimmer overlay
      for (let ry=cy;ry<cy+VIEW_H;ry++) for(let rx=cx;rx<cx+VIEW_W;rx++){
        if(map[ry]?.[rx]===T.WATER&&rev.has(`${rx},${ry}`)){
          const wave=0.12+Math.sin(time/600+rx*0.8+ry*1.1)*0.07;
          ctx.fillStyle=`rgba(30,90,200,${wave})`;ctx.fillRect((rx-cx)*TILE,(ry-cy)*TILE,TILE,TILE);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [TILE]);

  const addF = (x,y,text,color,big=false) => {
    const id=Math.random();
    setFloaters(f=>[...f.slice(-14),{id,x,y,text,color,big}]);
    setTimeout(()=>setFloaters(f=>f.filter(fl=>fl.id!==id)),960);
  };
  const shake=()=>{setShaking(true);setTimeout(()=>setShaking(false),400);};
  const flash=()=>{setScreenFlash(true);setTimeout(()=>setScreenFlash(false),420);};
  const revealAround=(set,px,py,r=4.5)=>{for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++)for(let dx=-Math.ceil(r);dx<=Math.ceil(r);dx++)if(Math.sqrt(dx*dx+dy*dy)<=r)set.add(`${Math.round(px+dx)},${Math.round(py+dy)}`);};
  const updateCam=(px,py)=>{const cx=Math.max(0,Math.min(MAP_W-VIEW_W,px-Math.floor(VIEW_W/2))),cy=Math.max(0,Math.min(MAP_H-VIEW_H,py-Math.floor(VIEW_H/2)));setCamX(cx);setCamY(cy);camRef.current={x:cx,y:cy};};

  const startGame=()=>{
    const p=initPlayer();const{map,rooms,start,torches:tc}=genMap(1);
    p.x=start.cx;p.y=start.cy;
    const rev=new Set();revealAround(rev,p.x,p.y);revealedRef.current=rev;
    setPlayer(p);setMapData(map);setTorches(tc);setEnemies(spawnEnemies(rooms,1));setRevealed(new Set(rev));updateCam(p.x,p.y);setPhase("playing");
  };

  const nextFloor=useCallback((p)=>{
    const nf=p.floor+1;const{map,rooms,start,torches:tc}=genMap(nf);const px=start.cx,py=start.cy;
    const rev=new Set();revealAround(rev,px,py);revealedRef.current=rev;
    setMapData(map);setTorches(tc);setEnemies(spawnEnemies(rooms,nf));setRevealed(new Set(rev));updateCam(px,py);
    const np={...p,x:px,y:py,floor:nf,score:p.score+200+nf*50,mana:Math.min(p.maxMana,p.mana+30)};
    np.log=[`▼ Floor ${nf} — deeper into darkness`,...np.log.slice(0,10)];
    setPlayer(np);addF(px,py,`FLOOR ${nf}!`,"#c8a060",true);
  },[]);

  const doAI=useCallback((np,es,map)=>{
    let curHp=np.hp;
    const newEs=es.map(e=>{
      if(!e.alive) return e;
      const dist=Math.abs(e.x-np.x)+Math.abs(e.y-np.y);if(dist>8) return e;
      let ex=e.x,ey=e.y;
      if(e.ai==="erratic"&&Math.random()<0.4){ex+=Math.floor(Math.random()*3)-1;ey+=Math.floor(Math.random()*3)-1;}
      else{const dx2=np.x>e.x?1:-1,dy2=np.y>e.y?1:-1;if(Math.abs(np.x-e.x)>Math.abs(np.y-e.y))ex+=dx2;else ey+=dy2;}
      ex=Math.max(0,Math.min(MAP_W-1,ex));ey=Math.max(0,Math.min(MAP_H-1,ey));
      if(map[ey]?.[ex]===T.WALL||map[ey]?.[ex]===T.PILLAR||es.some(e2=>e2.id!==e.id&&e2.alive&&e2.x===ex&&e2.y===ey)){ex=e.x;ey=e.y;}
      if(Math.abs(ex-np.x)<=1&&Math.abs(ey-np.y)<=1&&!(ex===np.x&&ey===np.y)){
        const eDmg=Math.max(1,e.atk-(np.def+np.tempDef)+Math.floor(Math.random()*4));
        curHp=Math.max(0,curHp-eDmg);addF(np.x,np.y,`-${eDmg}`,"#ff5533");
        if(curHp<=0){setPhase("over");if(onScore)onScore(np.score);}
      }
      return{...e,x:ex,y:ey};
    });
    enemiesRef.current=newEs;setEnemies(newEs);return curHp;
  },[onScore]);

  const resolveHit=(p2,hitE,es)=>{
    const crit=Math.random()<0.1+p2.level*0.02;
    const dmg=(crit?2:1)*(p2.atk+Math.floor(Math.random()*6));
    hitE.hp-=dmg;
    addF(hitE.x,hitE.y,crit?`CRIT! ${dmg}`:`-${dmg}`,crit?"#ffd12d":"#ff4444",crit);
    if(hitE.hp<=0){
      hitE.alive=false;
      const gainXp=hitE.xp,gainGold=Math.floor(hitE.xp*0.4);
      let np={...p2,xp:p2.xp+gainXp,score:p2.score+gainXp*3,gold:p2.gold+gainGold};
      addF(hitE.x,hitE.y,`+${gainXp}xp`,"#2dff8f");
      if(np.xp>=np.xpNext){np.level++;np.maxHp+=25;np.hp=Math.min(np.maxHp,np.hp+40);np.maxMana+=10;np.atk+=4;np.def+=1;np.xpNext=Math.floor(np.xpNext*1.6);addF(p2.x,p2.y,"LEVEL UP!","#ffd12d",true);np.log=[`★ Level ${np.level}!`,...np.log.slice(0,10)];}
      else np.log=[`✦ ${hitE.name} slain! +${gainXp}xp`,...np.log.slice(0,10)];
      const newEs=es.map(e=>e.id===hitE.id?{...hitE,alive:false}:e);
      enemiesRef.current=newEs;setEnemies([...newEs]);return{np,dead:true};
    }
    const eDmg=Math.max(1,hitE.atk-(p2.def+p2.tempDef)+Math.floor(Math.random()*4));
    shake();flash();addF(p2.x,p2.y,`-${eDmg}`,"#ff3333");
    const nhp=p2.hp-eDmg;
    if(nhp<=0){setPhase("over");if(onScore)onScore(p2.score);return{np:{...p2,hp:0},dead:false};}
    const newEs2=es.map(e=>e.id===hitE.id?hitE:e);
    enemiesRef.current=newEs2;setEnemies([...newEs2]);
    return{np:{...p2,hp:nhp,log:[`⚔ ${hitE.name} hits! -${eDmg}`,...p2.log.slice(0,10)]},dead:false};
  };

  const move=useCallback((dx,dy)=>{
    if(phase!=="playing") return;
    const map=mapRef.current;if(!map) return;
    setWalking(true);setTimeout(()=>setWalking(false),180);
    setPlayer(p=>{
      const nx=p.x+dx,ny=p.y+dy;
      if(nx<0||ny<0||nx>=MAP_W||ny>=MAP_H) return p;
      const tile=map[ny][nx];
      if(tile===T.WALL||tile===T.PILLAR) return p;
      const es=enemiesRef.current;
      const hitE=es.find(e=>e.alive&&e.x===nx&&e.y===ny);
      if(hitE){const{np}=resolveHit(p,hitE,es);return np;}
      let np={...p,x:nx,y:ny};
      if(np.tempDefTurns>0){np.tempDefTurns--;if(np.tempDefTurns===0)np.tempDef=0;}
      np.mana=Math.min(np.maxMana,np.mana+2);
      if(tile===T.CHEST){
        const item=ITEMS[Math.floor(Math.random()*ITEMS.length)];
        const nm=map.map((r,ri)=>r.map((c,ci)=>ri===ny&&ci===nx?T.FLOOR:c));setMapData(nm);mapRef.current=nm;
        if(item.type==="passive"){if(item.id==="battery"){np.maxHp+=item.value;np.hp=Math.min(np.maxHp,np.hp+item.value);}}
        else np.inventory=[...np.inventory.slice(-5),{...item,uses:item.uses??1}];
        addF(nx,ny,`${item.emoji} ${item.name}`,item.rarity==="rare"?"#d12dff":"#2dff8f");
        np.log=[`📦 Found: ${item.name}`,...np.log.slice(0,10)];
      }
      if(tile===T.TRAP&&Math.random()<0.7){
        const dmg=10+np.floor*4;np.hp=Math.max(1,np.hp-dmg);shake();flash();
        const nm=map.map((r,ri)=>r.map((c,ci)=>ri===ny&&ci===nx?T.FLOOR:c));setMapData(nm);mapRef.current=nm;
        addF(nx,ny,`TRAP -${dmg}`,"#ff8800",true);np.log=[`⚠ Spike trap! -${dmg} HP`,...np.log.slice(0,10)];
      }
      if(tile===T.SHRINE){
        np.hp=Math.min(np.maxHp,np.hp+40);np.mana=Math.min(np.maxMana,np.mana+30);np.score+=100;
        const nm=map.map((r,ri)=>r.map((c,ci)=>ri===ny&&ci===nx?T.FLOOR:c));setMapData(nm);mapRef.current=nm;
        addF(nx,ny,"SHRINE ✦","#cc88ff",true);np.log=[`✦ Sacred shrine! +40 HP +30 MP`,...np.log.slice(0,10)];
      }
      if(tile===T.WATER){np.mana=Math.min(np.maxMana,np.mana+5);addF(nx,ny,"+5 MP","#88ccff");}
      if(tile===T.STAIRS){nextFloor(np);return np;}
      const rev=new Set(revealedRef.current);revealAround(rev,nx,ny);revealedRef.current=rev;setRevealed(new Set(rev));
      updateCam(nx,ny);
      const curHp=doAI(np,es,map);
      return{...np,hp:curHp};
    });
  },[phase,nextFloor,doAI]);

  const attackNearest=useCallback(()=>{
    if(phase!=="playing") return;
    const p=playerRef.current,es=enemiesRef.current;
    const nearby=es.filter(e=>e.alive).sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(b.x-p.x)+Math.abs(b.y-p.y)));
    if(!nearby.length||Math.abs(nearby[0].x-p.x)+Math.abs(nearby[0].y-p.y)>2){addF(p.x,p.y,"OUT OF RANGE","#888");return;}
    setPlayer(p2=>{const{np}=resolveHit(p2,nearby[0],enemiesRef.current);return np;});
  },[phase]);

  const castSpell=useCallback(()=>{
    if(phase!=="playing") return;
    setCastEffect(true);setTimeout(()=>setCastEffect(false),700);
    setPlayer(p=>{
      const spell=p.spells[selectedSpell];
      if(!spell||p.mana<spell.manaCost){addF(p.x,p.y,"NO MANA","#9944ff");return p;}
      let np={...p,mana:p.mana-spell.manaCost};
      if(spell.id==="heal"){const h=Math.min(50,np.maxHp-np.hp);np.hp+=h;addF(p.x,p.y,`+${h} HP`,"#00ff88",true);np.log=[`💚 Heal: +${h} HP`,...np.log.slice(0,10)];}
      else if(spell.id==="shield"){np.tempDef=15;np.tempDefTurns=6;addF(p.x,p.y,"SHIELD +15","#aa88ff",true);np.log=[`🔮 Arcane Shield! DEF+15 (6 turns)`,...np.log.slice(0,10)];}
      else{
        const es=enemiesRef.current;
        let targets=spell.aoe>0?es.filter(e=>e.alive&&Math.abs(e.x-p.x)+Math.abs(e.y-p.y)<=spell.aoe):[...es.filter(e=>e.alive).sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(b.x-p.x)+Math.abs(b.y-p.y))).slice(0,1)];
        if(!targets.length){addF(p.x,p.y,"NO TARGETS","#9944ff");return np;}
        const newEs=es.map(e=>{if(!targets.find(t=>t.id===e.id)) return e;const dmg=spell.dmg+Math.floor(Math.random()*18);addF(e.x,e.y,`✦${dmg}`,spell.color,true);return{...e,hp:e.hp-dmg,alive:e.hp-dmg>0};});
        enemiesRef.current=newEs;setEnemies(newEs);
        np.log=[`${spell.emoji} ${spell.name} strikes ${targets.length} foe(s)!`,...np.log.slice(0,10)];
      }
      return np;
    });
  },[phase,selectedSpell]);

  const useItem=useCallback((idx)=>{
    if(phase!=="playing") return;
    setPlayer(p=>{
      const item=p.inventory[idx];if(!item) return p;
      let np={...p};
      if(item.type==="heal"){np.hp=Math.min(p.maxHp,p.hp+item.value);addF(p.x,p.y,`+${item.value} HP`,"#2dff8f",true);np.log=[`💊 ${item.name}: +${item.value} HP`,...np.log.slice(0,10)];}
      if(item.type==="weapon"){np.atk+=item.value;np.log=[`⚔ ${item.name} equipped! ATK+${item.value}`,...np.log.slice(0,10)];}
      if(item.type==="armor"){np.def+=item.value;np.log=[`🛡 ${item.name} equipped! DEF+${item.value}`,...np.log.slice(0,10)];}
      if(item.type==="active"){
        if(item.id==="grenade"){const newEs=enemiesRef.current.map(e=>{const d=Math.abs(e.x-p.x)+Math.abs(e.y-p.y);if(d<=3){addF(e.x,e.y,`-${item.value}`,"#ff8800",true);return{...e,hp:e.hp-item.value,alive:e.hp-item.value>0};}return e;});enemiesRef.current=newEs;setEnemies(newEs);addF(p.x,p.y,"💥 BOOM!","#ffd12d",true);}
        item.uses=(item.uses||1)-1;if(item.uses<=0){np.inventory=np.inventory.filter((_,i)=>i!==idx);return np;}
      } else np.inventory=np.inventory.filter((_,i)=>i!==idx);
      return np;
    });
  },[phase]);

  useEffect(()=>{
    const km={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]};
    const onKey=e=>{
      const m=km[e.key];if(m){e.preventDefault();move(...m);}
      if(e.code==="Space"&&phase!=="playing")startGame();
      if(e.key==="q"||e.key==="Q")attackNearest();
      if(e.key==="e"||e.key==="E")castSpell();
      if(e.key==="f"||e.key==="F")useItem(0);
      const n=parseInt(e.key)-1;if(!isNaN(n)&&n>=0&&n<6)useItem(n);
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[move,phase,attackNearest,castSpell,useItem]);

  const visEnemies=enemies.filter(e=>e.alive&&e.x>=camX&&e.x<camX+VIEW_W&&e.y>=camY&&e.y<camY+VIEW_H&&revealed.has(`${e.x},${e.y}`)&&Math.abs(e.x-player.x)<=9&&Math.abs(e.y-player.y)<=9);
  const hpPct=player.hp/player.maxHp;
  const manaPct=player.mana/player.maxMana;
  const xpPct=player.xp/player.xpNext;
  const mapW=VIEW_W*TILE, mapH=VIEW_H*TILE;
  const rarityColor=r=>r==="rare"?"#d12dff":r==="uncommon"?"#4488ff":"#66aaaa";

  return (
    <>
      <style>{CSS}</style>
      <div style={{width:"100vw",height:"100vh",display:"flex",background:"#020508",fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",userSelect:"none"}}>

        {/* ── Main Column ── */}
        <div style={{display:"flex",flexDirection:"column",flex:1,alignItems:"center",justifyContent:"center",gap:5,padding:"6px 6px 6px 8px",minWidth:0}}>

          {/* HUD */}
          <div style={{width:"100%",maxWidth:mapW,display:"flex",alignItems:"center",gap:14,padding:"0 2px"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#c8a060",letterSpacing:3,textShadow:"0 0 18px rgba(200,160,80,0.35)"}}>FLOOR {player.floor}</span>
            <span style={{fontSize:9,color:"#3a5a78"}}>Lv<span style={{color:"#ffd12d",fontSize:11,marginLeft:3}}>{player.level}</span></span>
            <span style={{fontSize:9,color:"#3a5a78"}}>Gold<span style={{color:"#ffd12d",marginLeft:3}}>{player.gold}</span></span>
            <span style={{marginLeft:"auto",fontSize:9,color:"#3a5a78"}}>Score<span style={{color:"#cc88ff",marginLeft:3}}>{player.score}</span></span>
          </div>

          {/* Map */}
          <div style={{position:"relative",width:mapW,height:mapH,flexShrink:0,borderRadius:2,overflow:"hidden",border:"1px solid rgba(180,130,60,0.12)",boxShadow:"0 0 80px rgba(0,0,0,0.97), inset 0 0 50px rgba(0,0,0,0.6)",animation:shaking?"shake 0.4s ease":"none"}}>
            <canvas ref={canvasRef} width={mapW} height={mapH} style={{position:"absolute",inset:0}}/>

            {/* SVG sprite overlay */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
              {visEnemies.map(e=>{
                const isBoss=e.name==="BOSS";
                const sz=isBoss?TILE*1.5:TILE;
                const lx=(e.x-camX)*TILE+(TILE-sz)/2;
                const ly=(e.y-camY)*TILE+(TILE-sz)/2-(isBoss?TILE*0.25:0);
                return (
                  <div key={e.id} style={{position:"absolute",left:lx,top:ly,width:sz,height:sz,zIndex:5,animation:"enemyBob 2.2s ease infinite",animationDelay:`${(e.id*997)%2200/1000}s`}}>
                    <EnemySprite spriteType={e.spriteType} size={sz} color={e.color}/>
                    <div style={{position:"absolute",bottom:-5,left:0,width:sz,height:3,background:"rgba(0,0,0,0.75)",borderRadius:1}}>
                      <div style={{height:"100%",width:`${(e.hp/e.maxHp)*100}%`,background:isBoss?"linear-gradient(90deg,#cc1133,#ff5500)":`linear-gradient(90deg,${e.color}77,${e.color})`,borderRadius:1,transition:"width 0.2s"}}/>
                    </div>
                    {isBoss&&<div style={{position:"absolute",top:-14,left:0,width:"100%",textAlign:"center",fontSize:7,color:"#ff2244",fontFamily:"'Cinzel',serif",letterSpacing:2,animation:"glowPulse 1.2s infinite"}}>BOSS</div>}
                  </div>
                );
              })}

              {phase==="playing"&&(
                <div style={{position:"absolute",left:(player.x-camX)*TILE,top:(player.y-camY)*TILE,width:TILE,height:TILE,zIndex:6,animation:"float 2.5s ease infinite"}}>
                  {castEffect&&(
                    <div style={{position:"absolute",left:"50%",top:"50%",width:TILE,height:TILE,border:"2px solid rgba(140,80,255,0.9)",borderRadius:"50%",animation:"castRing 0.7s ease forwards",zIndex:10}}/>
                  )}
                  <HeroSprite size={TILE} walking={walking} shielded={player.tempDef>0}/>
                </div>
              )}
            </div>

            {/* Floaters */}
            {floaters.map(f=>(
              <div key={f.id} style={{position:"absolute",left:(f.x-camX)*TILE+TILE/2,top:(f.y-camY)*TILE,color:f.color,fontSize:f.big?14:10,fontWeight:"bold",animation:"floatUp 0.96s ease forwards",pointerEvents:"none",zIndex:12,whiteSpace:"nowrap",textShadow:`0 0 18px ${f.color}, 0 1px 4px rgba(0,0,0,0.98)`,fontFamily:"'Cinzel',serif",letterSpacing:0.5}}>{f.text}</div>
            ))}

            <div style={{position:"absolute",left:0,right:0,height:1,background:"rgba(200,160,80,0.025)",pointerEvents:"none",zIndex:20,animation:"scanline 14s linear infinite"}}/>
            {screenFlash&&<div style={{position:"absolute",inset:0,animation:"screenFl 0.42s ease forwards",pointerEvents:"none",zIndex:18}}/>}

            {/* Overlay */}
            {(phase==="idle"||phase==="over")&&(
              <div style={{position:"absolute",inset:0,background:"rgba(1,3,8,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,zIndex:30,animation:"appear 0.5s ease"}}>
                <div style={{position:"absolute",inset:18,border:"1px solid rgba(180,130,60,0.18)",pointerEvents:"none"}}/>
                <div style={{position:"absolute",inset:24,border:"1px solid rgba(180,130,60,0.07)",pointerEvents:"none"}}/>
                {phase==="over"&&<div style={{fontFamily:"'Cinzel',serif",fontSize:22,color:"#cc3322",letterSpacing:6,textShadow:"0 0 30px rgba(200,50,30,0.55)",animation:"glowPulse 1.5s infinite"}}>THOU ART SLAIN</div>}
                {phase==="idle"&&<div style={{fontFamily:"'Cinzel',serif",fontSize:28,color:"#c8a060",letterSpacing:5,textShadow:"0 0 30px rgba(200,160,80,0.45)",textAlign:"center",lineHeight:1.5}}>DUNGEON<br/>DEPTHS</div>}
                {phase==="over"&&<div style={{fontSize:9,color:"#446688",letterSpacing:3}}>FLOOR {player.floor}  ·  SCORE {player.score}  ·  LV {player.level}</div>}
                {phase==="idle"&&<div style={{fontSize:8,color:"#1e3a52",letterSpacing:1.5,textAlign:"center",lineHeight:2.6,borderTop:"1px solid rgba(180,130,60,0.1)",paddingTop:14}}>WASD / ARROWS — MOVE · WALK INTO ENEMIES TO ATTACK<br/>Q — ATTACK  ·  E — CAST SPELL  ·  F — USE ITEM<br/>1–6 — INVENTORY  ·  ▼ STAIRS = NEXT FLOOR</div>}
                <button onClick={startGame}
                  style={{padding:"13px 44px",background:"transparent",color:"#c8a060",border:"1px solid rgba(200,160,80,0.45)",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:5,cursor:"pointer",boxShadow:"0 0 22px rgba(200,160,80,0.12)",transition:"all 0.25s"}}
                  onMouseEnter={e=>{e.target.style.background="rgba(200,160,80,0.07)";e.target.style.borderColor="rgba(200,160,80,0.75)";e.target.style.boxShadow="0 0 40px rgba(200,160,80,0.25)";}}
                  onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(200,160,80,0.45)";e.target.style.boxShadow="0 0 22px rgba(200,160,80,0.12)";}}
                >{phase==="idle"?"DESCEND":"RISE AGAIN"}</button>
              </div>
            )}
          </div>

          {/* Bars */}
          <div style={{width:"100%",maxWidth:mapW,display:"flex",flexDirection:"column",gap:3}}>
            {[
              {l:"HP",pct:hpPct,v:`${player.hp}/${player.maxHp}`,c:hpPct>0.5?"#2dff8f":hpPct>0.25?"#ffd12d":"#ff4422",blink:hpPct<0.25,h:7,bar:hpPct>0.5?"linear-gradient(90deg,#18ee6a,#2dff8f)":hpPct>0.25?"linear-gradient(90deg,#cc9900,#ffd12d)":"linear-gradient(90deg,#cc2200,#ff4422)"},
              {l:"MP",pct:manaPct,v:`${player.mana}/${player.maxMana}`,c:"#8866ff",h:5,bar:"linear-gradient(90deg,#4422bb,#8844ff)"},
              {l:"XP",pct:xpPct,v:`${player.xp}/${player.xpNext}`,c:"#c8a060",h:4,bar:"linear-gradient(90deg,#8a6000,#c8a060)"},
            ].map(({l,pct,v,c,blink,h,bar})=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:8,color:"#2a4050",width:18,fontFamily:"'Cinzel',serif",letterSpacing:0.5}}>{l}</span>
                <div style={{flex:1,height:h,background:"#050d18",border:"1px solid #0a1a28",borderRadius:1,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct*100}%`,background:bar,transition:"width 0.25s",borderRadius:1}}/>
                </div>
                <span style={{fontSize:8,color:c,width:60,textAlign:"right",animation:blink?"hpBlink 1s infinite":"none",fontVariantNumeric:"tabular-nums"}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Actions + D-pad */}
          <div style={{width:"100%",maxWidth:mapW,display:"flex",gap:5,alignItems:"center"}}>
            {/* D-Pad */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,30px)",gridTemplateRows:"repeat(3,30px)",gap:2,flexShrink:0}}>
              {[null,[0,-1,"▲"],null,[-1,0,"◄"],null,[1,0,"►"],null,[0,1,"▼"],null].map((btn,i)=>
                btn?<button key={i} onMouseDown={()=>move(btn[0],btn[1])} style={{width:30,height:30,background:"rgba(5,12,24,0.95)",border:"1px solid rgba(180,130,60,0.18)",color:"#5a4428",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,borderRadius:3,transition:"all 0.1s"}}
                  onMouseEnter={e=>{e.target.style.borderColor="rgba(200,160,80,0.5)";e.target.style.color="#c8a060";}}
                  onMouseLeave={e=>{e.target.style.borderColor="rgba(180,130,60,0.18)";e.target.style.color="#5a4428";}}
                >{btn[2]}</button>:<div key={i} style={{width:30,height:30}}/>
              )}
            </div>

            {/* Action buttons */}
            {[
              {l:"ATTACK",s:"[Q]",ic:"⚔",cc:"#cc5533",glow:"rgba(200,80,50,0.28)",fn:attackNearest,off:false},
              {l:player.spells[selectedSpell]?.name||"SPELL",s:"[E]",ic:player.spells[selectedSpell]?.emoji||"✨",cc:"#8844cc",glow:"rgba(140,60,220,0.28)",fn:castSpell,off:player.mana<(player.spells[selectedSpell]?.manaCost||0)},
              {l:player.inventory[0]?.name?.slice(0,8)||"ITEM",s:"[F]",ic:player.inventory[0]?.emoji||"🎒",cc:"#aa8844",glow:"rgba(180,140,60,0.28)",fn:()=>useItem(0),off:!player.inventory.length},
            ].map(({l,s,ic,cc,glow,fn,off})=>(
              <button key={l} onClick={fn} disabled={off}
                style={{flex:1,height:50,background:"rgba(3,8,18,0.95)",border:`1px solid ${cc}44`,color:off?"#2a2a2a":`${cc}bb`,cursor:off?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,borderRadius:3,transition:"all 0.15s",opacity:off?0.4:1,fontFamily:"'Cinzel',serif"}}
                onMouseEnter={e=>{if(!off){e.currentTarget.style.borderColor=`${cc}99`;e.currentTarget.style.background=`rgba(${parseInt(cc.slice(1,3),16)},${parseInt(cc.slice(3,5),16)},${parseInt(cc.slice(5,7),16)},0.1)`;e.currentTarget.style.boxShadow=`0 0 16px ${glow}`;e.currentTarget.style.color=cc;}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${cc}44`;e.currentTarget.style.background="rgba(3,8,18,0.95)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.color=`${cc}bb`;}}>
                <span style={{fontSize:16,lineHeight:1}}>{ic}</span>
                <span style={{fontSize:7,letterSpacing:1.5}}>{l}</span>
                <span style={{fontSize:6,color:"#1e2e3a",letterSpacing:1}}>{s}</span>
              </button>
            ))}

            {/* Spell selector */}
            <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
              {player.spells.map((sp,i)=>(
                <button key={sp.id} onClick={()=>setSelectedSpell(i)} style={{width:40,height:16,background:selectedSpell===i?"rgba(90,45,170,0.28)":"rgba(3,7,17,0.9)",border:`1px solid ${selectedSpell===i?"rgba(130,75,215,0.6)":"rgba(55,27,95,0.22)"}`,color:selectedSpell===i?"#bb88ff":"#3a2a55",fontSize:6,cursor:"pointer",borderRadius:2,letterSpacing:0.5,display:"flex",alignItems:"center",gap:3,paddingLeft:4,transition:"all 0.12s"}}>
                  <span style={{fontSize:9}}>{sp.emoji}</span><span style={{fontFamily:"'Share Tech Mono',monospace"}}>{sp.manaCost}mp</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{width:213,background:"#020910",borderLeft:"1px solid rgba(180,130,60,0.07)",display:"flex",flexDirection:"column",padding:"10px 9px",gap:9,overflow:"hidden",flexShrink:0}}>

          {/* Stats */}
          <div style={{border:"1px solid rgba(180,130,60,0.12)",borderRadius:2,padding:"8px",background:"rgba(4,9,18,0.6)"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"rgba(200,160,80,0.7)",letterSpacing:3,marginBottom:7}}>CHARACTER</div>
            {[["⚔","ATK",player.atk,"#cc5533"],["🛡","DEF",player.tempDef>0?`${player.def}+${player.tempDef}`:player.def,"#4488cc"],["★","LVL",player.level,"#c8a060"]].map(([ic,l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,marginBottom:4,letterSpacing:0.5}}>
                <span style={{color:"#243444"}}>{ic} {l}</span>
                <span style={{color:c,fontWeight:"bold",fontSize:11,fontFamily:"'Cinzel',serif"}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Spells */}
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"rgba(140,80,220,0.7)",letterSpacing:3,marginBottom:5,borderBottom:"1px solid rgba(100,45,170,0.12)",paddingBottom:3}}>GRIMOIRE</div>
            {player.spells.map((sp,i)=>(
              <div key={sp.id} onClick={()=>setSelectedSpell(i)}
                style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:3,background:selectedSpell===i?"rgba(75,38,145,0.18)":"rgba(3,7,17,0.7)",border:`1px solid ${selectedSpell===i?"rgba(115,65,195,0.5)":"rgba(48,22,92,0.18)"}`,cursor:"pointer",borderRadius:2,transition:"all 0.12s",opacity:player.mana>=sp.manaCost?1:0.42}}>
                <span style={{fontSize:13}}>{sp.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:7,color:selectedSpell===i?"#bb88ff":"#4a3462",fontFamily:"'Cinzel',serif",letterSpacing:0.5}}>{sp.name}</div>
                  <div style={{fontSize:6,color:"#221538"}}>{sp.manaCost}MP{sp.dmg?` · ${sp.dmg}+ dmg`:""}</div>
                </div>
                {selectedSpell===i&&<div style={{width:2,height:16,background:"rgba(130,75,255,0.75)",borderRadius:1}}/>}
              </div>
            ))}
          </div>

          {/* Inventory */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"rgba(200,160,80,0.7)",letterSpacing:3,marginBottom:5,borderBottom:"1px solid rgba(180,130,60,0.1)",paddingBottom:3}}>SATCHEL ({player.inventory.length}/6)</div>
            {player.inventory.length===0&&<div style={{fontSize:8,color:"#0c1c2c",letterSpacing:1,fontStyle:"italic"}}>Empty...</div>}
            <div style={{overflow:"auto",flex:1}}>
              {player.inventory.map((item,i)=>(
                <div key={i} onClick={()=>useItem(i)}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${rarityColor(item.rarity)}55`;setInspecting(item);}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=`${rarityColor(item.rarity)}22`;setInspecting(null);}}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 6px",marginBottom:3,background:"rgba(4,9,20,0.8)",border:`1px solid ${rarityColor(item.rarity)}22`,cursor:"pointer",borderRadius:2,transition:"all 0.1s"}}>
                  <span style={{fontSize:13}}>{item.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:8,color:rarityColor(item.rarity),letterSpacing:0.3}}>{item.name}</div>
                    {item.uses&&<div style={{fontSize:6,color:"#18283a"}}>uses: {item.uses}</div>}
                  </div>
                  <span style={{fontSize:6,color:"#0a1820"}}>[{i+1}]</span>
                </div>
              ))}
            </div>
            {inspecting&&(
              <div style={{padding:"7px 8px",background:"rgba(3,9,20,0.95)",border:"1px solid rgba(180,130,60,0.18)",borderRadius:2,marginTop:5,flexShrink:0}}>
                <div style={{fontSize:9,color:"#c8a060",marginBottom:3,fontFamily:"'Cinzel',serif"}}>{inspecting.emoji} {inspecting.name}</div>
                <div style={{fontSize:7,color:"#3a5870",lineHeight:1.7}}>{inspecting.desc}</div>
              </div>
            )}
          </div>

          {/* Log */}
          <div style={{flexShrink:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"rgba(68,110,140,0.7)",letterSpacing:3,marginBottom:5,borderBottom:"1px solid rgba(40,80,120,0.12)",paddingBottom:3}}>CHRONICLE</div>
            <div style={{maxHeight:88,overflow:"auto"}}>
              {player.log.map((msg,i)=>(
                <div key={i} style={{fontSize:7,color:i===0?"#7abbc8":i<3?"#294555":"#0d1e2e",marginBottom:3,lineHeight:1.6,letterSpacing:0.3}}>{msg}</div>
              ))}
            </div>
          </div>

          <div style={{fontSize:6,color:"#0a1620",letterSpacing:0.8,lineHeight:2,borderTop:"1px solid rgba(180,130,60,0.05)",paddingTop:5}}>
            WASD MOVE · Q ATK · E SPELL<br/>F ITEM · 1-6 SLOTS
          </div>
        </div>
      </div>
    </>
  );
}
