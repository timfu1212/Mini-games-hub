import { useState, useEffect, useRef } from "react";

const W = 600;
const H = 420;
const PLAYER_R = 10;
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;700;900&display=swap');
  @keyframes dg-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.8} }
  @keyframes dg-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes dg-shake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-4px,2px)} 40%{transform:translate(4px,-2px)} 60%{transform:translate(-2px,-4px)} 80%{transform:translate(2px,4px)} }
  @keyframes dg-appear { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
`;

function randEdge() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * W, y: -20, side };
  if (side === 1) return { x: W + 20, y: Math.random() * H, side };
  if (side === 2) return { x: Math.random() * W, y: H + 20, side };
  return { x: -20, y: Math.random() * H, side };
}

const SHAPES = ["circle", "triangle", "square", "diamond"];
const COLORS = ["#ff2d78", "#ff6b2d", "#ffd12d", "#f0f", "#0ff"];

export default function DodgeGame({ onScore }) {
  const canvasRef = useRef();
  const animRef = useRef();
  const stateRef = useRef(null);
  const mouseRef = useRef({ x: W / 2, y: H / 2 });
  const [ui, setUi] = useState({ phase: "idle", score: 0, best: 0, shake: false });

  const buildState = () => ({
    player: { x: W / 2, y: H / 2 },
    enemies: [],
    particles: [],
    score: 0,
    speed: 2.2,
    spawnTimer: 0,
    spawnInterval: 90,
    invincible: 0,
    phase: "playing",
    trail: [],
  });

  const spawnEnemy = (s) => {
    const { x, y } = randEdge();
    const angle = Math.atan2(s.player.y - y, s.player.x - x);
    const spd = s.speed + Math.random() * 1.2;
    return {
      x, y,
      vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 0.8,
      vy: Math.sin(angle) * spd + (Math.random() - 0.5) * 0.8,
      r: 10 + Math.random() * 14,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.1,
      id: Math.random(),
    };
  };

  const addParticles = (x, y, color, count = 12) => {
    const s = stateRef.current;
    if (!s) return;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      s.particles.push({
        x, y,
        vx: Math.cos(a) * (2 + Math.random() * 4),
        vy: Math.sin(a) * (2 + Math.random() * 4),
        life: 1, color,
        r: 2 + Math.random() * 3,
      });
    }
  };

  const drawShape = (ctx, e) => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rot);
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = e.color + "cc";
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (e.shape === "circle") {
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    } else if (e.shape === "square") {
      ctx.rect(-e.r, -e.r, e.r * 2, e.r * 2);
    } else if (e.shape === "triangle") {
      ctx.moveTo(0, -e.r);
      ctx.lineTo(e.r, e.r);
      ctx.lineTo(-e.r, e.r);
      ctx.closePath();
    } else {
      ctx.moveTo(0, -e.r);
      ctx.lineTo(e.r, 0);
      ctx.lineTo(0, e.r);
      ctx.lineTo(-e.r, 0);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    ctx.fillStyle = "#060010";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(100,0,200,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    if (!s) return;

    // Trail
    s.trail.forEach((p, i) => {
      const a = (i / s.trail.length) * 0.4;
      ctx.fillStyle = `rgba(0,220,255,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, PLAYER_R * (i / s.trail.length) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    s.enemies.forEach(e => drawShape(ctx, e));

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Player
    const inv = s.invincible > 0 && Math.floor(s.invincible / 4) % 2 === 0;
    if (!inv) {
      ctx.shadowColor = "#00ddff";
      ctx.shadowBlur = 20;
      const pg = ctx.createRadialGradient(s.player.x, s.player.y, 2, s.player.x, s.player.y, PLAYER_R);
      pg.addColorStop(0, "#fff");
      pg.addColorStop(1, "#00aaff");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();
      // Ring
      ctx.strokeStyle = "rgba(0,220,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, PLAYER_R + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Scanlines
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, y, W, 2);
    }
  };

  const tick = () => {
    const s = stateRef.current;
    if (!s || s.phase !== "playing") { draw(); animRef.current = requestAnimationFrame(tick); return; }

    // Move player toward mouse (smooth)
    const mx = mouseRef.current.x, my = mouseRef.current.y;
    s.player.x += (mx - s.player.x) * 0.18;
    s.player.y += (my - s.player.y) * 0.18;
    s.player.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, s.player.x));
    s.player.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, s.player.y));

    // Trail
    s.trail.push({ x: s.player.x, y: s.player.y });
    if (s.trail.length > 14) s.trail.shift();

    // Spawn
    s.spawnTimer++;
    if (s.spawnTimer >= s.spawnInterval) {
      s.enemies.push(spawnEnemy(s));
      s.spawnTimer = 0;
      s.spawnInterval = Math.max(25, s.spawnInterval - 0.3);
    }

    // Move enemies
    s.enemies = s.enemies.map(e => ({
      ...e,
      x: e.x + e.vx,
      y: e.y + e.vy,
      rot: e.rot + e.rotV,
    })).filter(e => e.x > -60 && e.x < W + 60 && e.y > -60 && e.y < H + 60);

    // Collision
    if (s.invincible <= 0) {
      for (const e of s.enemies) {
        const dx = s.player.x - e.x, dy = s.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PLAYER_R + e.r * 0.8) {
          addParticles(s.player.x, s.player.y, "#00ddff", 20);
          s.phase = "over";
          stateRef.current = s;
          setUi(u => ({ ...u, phase: "over", score: s.score, best: Math.max(u.best, s.score), shake: true }));
          setTimeout(() => setUi(u => ({ ...u, shake: false })), 500);
          if (onScore) onScore(s.score);
          draw();
          return;
        }
      }
    }
    if (s.invincible > 0) s.invincible--;

    // Particles
    s.particles = s.particles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1, life: p.life - 0.03 }))
      .filter(p => p.life > 0);

    // Score
    s.score++;
    s.speed = 2.2 + s.score / 400;
    if (s.score % 60 === 0) setUi(u => ({ ...u, score: s.score }));

    draw();
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const start = () => {
    stateRef.current = buildState();
    mouseRef.current = { x: W / 2, y: H / 2 };
    setUi(u => ({ ...u, phase: "playing", score: 0 }));
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const onMove = e => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top) * (H / rect.height),
      };
    };
    const onKey = e => { if (e.code === "Space") { e.preventDefault(); if (ui.phase !== "playing") start(); } };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("keydown", onKey); };
  }, [ui.phase]);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060010", fontFamily: "'Exo 2',sans-serif", gap: 10 }}>
        <div style={{ display: "flex", gap: 40, fontSize: 12, color: "#6600cc", letterSpacing: 3, alignItems: "center" }}>
          <span>SCORE <span style={{ color: "#00ddff", fontSize: 18 }}>{ui.score}</span></span>
          <span style={{ color: "#00ddff", fontSize: 18, letterSpacing: 6, fontWeight: 900 }}>DODGE</span>
          <span>BEST <span style={{ color: "#00ddff" }}>{ui.best}</span></span>
        </div>

        <div style={{ position: "relative", animation: ui.shake ? "dg-shake 0.4s ease" : "none" }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", cursor: "none", border: "1px solid #2200aa44", boxShadow: "0 0 40px #00ddff11" }} onClick={() => { if (ui.phase !== "playing") start(); }} />
          {ui.phase !== "playing" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(6,0,16,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, animation: "dg-appear 0.3s ease" }}>
              {ui.phase === "over" && <div style={{ fontSize: 32, color: "#ff2d78", letterSpacing: 4, fontWeight: 900, textShadow: "0 0 20px #ff2d78" }}>DEAD</div>}
              {ui.phase === "idle" && <div style={{ fontSize: 24, color: "#00ddff", letterSpacing: 6, fontWeight: 900, textShadow: "0 0 20px #00ddff" }}>DODGE</div>}
              {ui.phase !== "idle" && <div style={{ fontSize: 13, color: "#6600cc", letterSpacing: 2 }}>SCORE <span style={{ color: "#00ddff" }}>{ui.score}</span></div>}
              <div style={{ fontSize: 10, color: "#00ddff", letterSpacing: 3, animation: "dg-blink 1s infinite" }}>MOVE MOUSE · CLICK TO START</div>
              <button onClick={start} style={{ marginTop: 8, padding: "10px 32px", background: "transparent", color: "#00ddff", border: "2px solid #00ddff", fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 4, cursor: "pointer" }}
                onMouseEnter={e => e.target.style.background = "#00ddff22"}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >{ui.phase === "idle" ? "START" : "RETRY"}</button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 9, color: "#2200aa", letterSpacing: 2 }}>MOVE MOUSE TO DODGE · SURVIVE AS LONG AS POSSIBLE</div>
      </div>
    </>
  );
}
