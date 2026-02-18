import { useState, useEffect, useRef, useCallback } from "react";

const W = 700;
const H = 440;
const PAD_W = 100;
const PAD_H = 12;
const PAD_Y = H - 50;
const BALL_R = 8;
const BRICK_COLS = 12;
const BRICK_ROWS = 6;
const BRICK_W = 50;
const BRICK_H = 18;
const BRICK_GAP = 4;
const BRICK_OFF_X = (W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
const BRICK_OFF_Y = 45;

const ROW_COLORS = [
  ["#ff2d78", "#ff6da0", 15],
  ["#ff6b2d", "#ffaa6d", 12],
  ["#ffd12d", "#ffe87a", 10],
  ["#2dff8f", "#7affd4", 8],
  ["#2d8fff", "#7ac4ff", 6],
  ["#d12dff", "#e87aff", 5],
];

function makeBricks() {
  return Array.from({ length: BRICK_ROWS }, (_, r) =>
    Array.from({ length: BRICK_COLS }, (_, c) => ({
      x: BRICK_OFF_X + c * (BRICK_W + BRICK_GAP),
      y: BRICK_OFF_Y + r * (BRICK_H + BRICK_GAP),
      alive: true,
      row: r,
    }))
  ).flat();
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&display=swap');
  @keyframes brk-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes brk-pop { 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }
`;

export default function Breakout({ onScore }) {
  const canvasRef = useRef();
  const stateRef = useRef(null);
  const animRef = useRef();
  const [ui, setUi] = useState({ state: "ready", score: 0, lives: 3, best: 0 });

  const buildState = () => ({
    padX: W / 2 - PAD_W / 2,
    ball: { x: W / 2, y: PAD_Y - BALL_R - 2, vx: 3.8, vy: -4.5 },
    bricks: makeBricks(),
    score: 0,
    lives: 3,
    phase: "playing",
    particles: [],
  });

  const spawnParticles = (x, y, color) => {
    const ps = stateRef.current?.particles;
    if (!ps) return;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      ps.push({ x, y, vx: Math.cos(angle) * (2 + Math.random() * 3), vy: Math.sin(angle) * (2 + Math.random() * 3), life: 1, color });
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0d0016");
    bg.addColorStop(1, "#140030");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(180,50,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Horizon glow
    const hg = ctx.createLinearGradient(0, H * 0.65, 0, H);
    hg.addColorStop(0, "rgba(255,45,120,0.15)");
    hg.addColorStop(1, "transparent");
    ctx.fillStyle = hg;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    // Perspective lines
    ctx.strokeStyle = "rgba(255,45,120,0.08)";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(W / 2, H * 0.65);
      ctx.lineTo((W / 7) * i, H);
      ctx.stroke();
    }

    if (!s) return;

    // Bricks
    s.bricks.forEach(b => {
      if (!b.alive) return;
      const [c1, c2, pts] = ROW_COLORS[b.row];
      const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + BRICK_H);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2 + "99");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
      ctx.fill();
      // border glow
      ctx.strokeStyle = c1 + "cc";
      ctx.lineWidth = 1;
      ctx.stroke();
      // shine
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(b.x + 2, b.y + 2, BRICK_W - 4, 4);
      // point label
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "bold 8px Orbitron,monospace";
      ctx.textAlign = "center";
      ctx.fillText(pts, b.x + BRICK_W / 2, b.y + BRICK_H - 4);
    });

    // Particles
    s.particles.forEach((p, i) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Paddle
    ctx.shadowColor = "#ff2d78";
    ctx.shadowBlur = 18;
    const pg = ctx.createLinearGradient(s.padX, 0, s.padX + PAD_W, 0);
    pg.addColorStop(0, "#ff2d78");
    pg.addColorStop(0.5, "#ffaaee");
    pg.addColorStop(1, "#2d8fff");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(s.padX, PAD_Y, PAD_W, PAD_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball
    ctx.shadowColor = "#ffd12d";
    ctx.shadowBlur = 22;
    const ballG = ctx.createRadialGradient(s.ball.x - 2, s.ball.y - 2, 1, s.ball.x, s.ball.y, BALL_R);
    ballG.addColorStop(0, "#fff");
    ballG.addColorStop(1, "#ffd12d");
    ctx.fillStyle = ballG;
    ctx.beginPath();
    ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Scanlines
    ctx.fillStyle = "rgba(0,0,0,0)";
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, y, W, 2);
    }
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== "playing") { draw(); animRef.current = requestAnimationFrame(tick); return; }

    const b = s.ball;

    // Move particles
    s.particles = s.particles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 0.04 }))
      .filter(p => p.life > 0);

    b.x += b.vx; b.y += b.vy;

    // Walls
    if (b.x - BALL_R <= 0) { b.x = BALL_R; b.vx = Math.abs(b.vx); }
    if (b.x + BALL_R >= W) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx); }
    if (b.y - BALL_R <= 0) { b.y = BALL_R; b.vy = Math.abs(b.vy); }

    // Paddle
    if (b.y + BALL_R >= PAD_Y && b.y + BALL_R <= PAD_Y + PAD_H + 6 && b.x >= s.padX && b.x <= s.padX + PAD_W) {
      b.vy = -Math.abs(b.vy);
      b.vx = ((b.x - (s.padX + PAD_W / 2)) / (PAD_W / 2)) * 5.5;
      b.y = PAD_Y - BALL_R - 1;
    }

    // Bricks
    for (const brick of s.bricks) {
      if (!brick.alive) continue;
      if (b.x + BALL_R > brick.x && b.x - BALL_R < brick.x + BRICK_W && b.y + BALL_R > brick.y && b.y - BALL_R < brick.y + BRICK_H) {
        brick.alive = false;
        const pts = ROW_COLORS[brick.row][2];
        s.score += pts;
        spawnParticles(brick.x + BRICK_W / 2, brick.y + BRICK_H / 2, ROW_COLORS[brick.row][0]);
        const ol = (b.x + BALL_R) - brick.x;
        const or2 = (brick.x + BRICK_W) - (b.x - BALL_R);
        const ot = (b.y + BALL_R) - brick.y;
        const ob = (brick.y + BRICK_H) - (b.y - BALL_R);
        if (Math.min(ol, or2) < Math.min(ot, ob)) b.vx = -b.vx; else b.vy = -b.vy;
        setUi(u => ({ ...u, score: s.score }));
        break;
      }
    }

    // Win
    if (s.bricks.every(b => !b.alive)) {
      s.phase = "win";
      setUi(u => ({ ...u, state: "win", score: s.score, best: Math.max(u.best, s.score) }));
      if (onScore) onScore(s.score);
    }

    // Ball lost
    if (b.y - BALL_R > H) {
      s.lives--;
      setUi(u => ({ ...u, lives: s.lives }));
      if (s.lives <= 0) {
        s.phase = "over";
        setUi(u => ({ ...u, state: "over", score: s.score, best: Math.max(u.best, s.score) }));
        if (onScore) onScore(s.score);
      } else {
        b.x = W / 2; b.y = PAD_Y - BALL_R - 2;
        b.vx = 3.8; b.vy = -4.5;
      }
    }

    draw();
    animRef.current = requestAnimationFrame(tick);
  }, [draw]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [tick]);

  const start = () => {
    stateRef.current = buildState();
    setUi(u => ({ ...u, state: "playing", score: 0, lives: 3 }));
  };

  useEffect(() => {
    const onMove = e => {
      if (!stateRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (e.clientX - rect.left) * (W / rect.width);
      stateRef.current.padX = Math.max(0, Math.min(W - PAD_W, mx - PAD_W / 2));
    };
    const onKey = e => {
      if (e.code === "Space") { e.preventDefault(); if (ui.state !== "playing") start(); }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("keydown", onKey); };
  }, [ui.state]);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0016", fontFamily: "Orbitron,monospace", gap: 10 }}>
        {/* HUD */}
        <div style={{ display: "flex", gap: 48, fontSize: 11, color: "#aa44ff", letterSpacing: 3, alignItems: "center" }}>
          <span>SCORE <span style={{ color: "#ffd12d", fontSize: 16 }}>{ui.score}</span></span>
          <span style={{ color: "#ff2d78", fontSize: 16, letterSpacing: 6, textShadow: "0 0 12px #ff2d78" }}>BREAKOUT</span>
          <span>BEST <span style={{ color: "#ffd12d" }}>{ui.best}</span></span>
          <span style={{ fontSize: 16 }}>{"♥".repeat(Math.max(0, ui.lives))}{"♡".repeat(Math.max(0, 3 - ui.lives))}</span>
        </div>

        {/* Canvas */}
        <div style={{ position: "relative", border: "1px solid #aa44ff33", boxShadow: "0 0 50px #aa44ff18, 0 0 100px #ff2d7808" }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ display: "block", cursor: "none", maxWidth: "100%" }}
            onClick={() => { if (ui.state !== "playing") start(); }}
          />
          {ui.state !== "playing" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(13,0,22,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, backdropFilter: "blur(3px)" }}>
              {ui.state === "over" && <div style={{ fontSize: 28, color: "#ff2d78", letterSpacing: 4, textShadow: "0 0 24px #ff2d78" }}>GAME OVER</div>}
              {ui.state === "win" && <div style={{ fontSize: 28, color: "#ffd12d", letterSpacing: 4, textShadow: "0 0 24px #ffd12d" }}>YOU WIN!</div>}
              {ui.state === "ready" && <div style={{ fontSize: 22, color: "#aa44ff", letterSpacing: 6, textShadow: "0 0 18px #aa44ff" }}>BREAKOUT</div>}
              {ui.state !== "ready" && <div style={{ fontSize: 12, color: "#aa44ff", letterSpacing: 2 }}>SCORE <span style={{ color: "#ffd12d" }}>{ui.score}</span></div>}
              <button onClick={start} style={{ marginTop: 8, padding: "10px 32px", background: "transparent", color: "#ff2d78", border: "2px solid #ff2d78", fontFamily: "Orbitron,monospace", fontSize: 11, letterSpacing: 3, cursor: "pointer", boxShadow: "0 0 14px #ff2d7844" }}
                onMouseEnter={e => e.target.style.background = "#ff2d7822"}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >{ui.state === "ready" ? "START" : "RETRY"}</button>
              <div style={{ fontSize: 8, color: "#440066", letterSpacing: 2 }}>MOUSE TO AIM · SPACE TO START</div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 8, color: "#330044", letterSpacing: 2 }}>MOVE MOUSE · CLICK OR SPACE TO START</div>
      </div>
    </>
  );
}
