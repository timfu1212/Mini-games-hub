import { useState, useEffect, useCallback } from "react";

const SIZE = 5;
const TOTAL = SIZE * SIZE;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;700&display=swap');
  @keyframes lo-on { 0%{transform:scale(0.9);opacity:0.6} 100%{transform:scale(1);opacity:1} }
  @keyframes lo-off { 0%{transform:scale(1.05)} 100%{transform:scale(1)} }
  @keyframes lo-win { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4)} }
  @keyframes lo-appear { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lo-number { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
`;

const getNeighbors = (idx) => {
  const r = Math.floor(idx / SIZE),
    c = idx % SIZE;
  return [
    idx,
    r > 0 && idx - SIZE,
    r < SIZE - 1 && idx + SIZE,
    c > 0 && idx - 1,
    c < SIZE - 1 && idx + 1,
  ].filter((n) => n !== false);
};

const toggle = (grid, idx) => {
  const next = [...grid];
  getNeighbors(idx).forEach((n) => {
    next[n] = !next[n];
  });
  return next;
};

function generatePuzzle(difficulty = 6) {
  let grid = Array(TOTAL).fill(false);
  const moves = [];
  for (let i = 0; i < difficulty; i++) {
    const idx = Math.floor(Math.random() * TOTAL);
    grid = toggle(grid, idx);
    moves.push(idx);
  }
  // Avoid trivially solved
  if (grid.every((c) => !c)) return generatePuzzle(difficulty);
  return grid;
}

const DIFFICULTIES = [
  { label: "EASY", clicks: 5 },
  { label: "NORMAL", clicks: 8 },
  { label: "HARD", clicks: 12 },
];

export default function LightsOut({ onScore }) {
  const [grid, setGrid] = useState(() => generatePuzzle(8));
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle|playing|won
  const [difficulty, setDifficulty] = useState(1);
  const [best, setBest] = useState({});
  const [history, setHistory] = useState([]);
  const [highlightNeighbors, setHighlightNeighbors] = useState([]);

  const start = useCallback(
    (diff = difficulty) => {
      const d = DIFFICULTIES[diff];
      setGrid(generatePuzzle(d.clicks));
      setMoves(0);
      setHistory([]);
      setPhase("playing");
      setDifficulty(diff);
    },
    [difficulty],
  );

  const click = (idx) => {
    if (phase !== "playing") return;
    const next = toggle(grid, idx);
    setGrid(next);
    setMoves((m) => m + 1);
    setHistory((h) => [...h, grid]);
    setHighlightNeighbors(getNeighbors(idx));
    setTimeout(() => setHighlightNeighbors([]), 200);

    if (next.every((c) => !c)) {
      const sc = Math.max(0, 1000 - moves * 15);
      setBest((b) => ({
        ...b,
        [difficulty]: Math.max(b[difficulty] || 0, sc),
      }));
      if (onScore) onScore(sc);
      setPhase("won");
    }
  };

  const undo = () => {
    if (!history.length || phase !== "playing") return;
    setGrid(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyZ" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
      }
      if (e.code === "KeyR") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [history, phase, start]);

  const onCount = grid.filter(Boolean).length;
  const offCount = TOTAL - onCount;

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%231a1a1a'/%3E%3Crect width='1' height='1' fill='%23202020'/%3E%3C/svg%3E\")",
          fontFamily: "'Barlow Condensed',sans-serif",
          gap: 20,
          position: "relative",
        }}
      >
        {/* Title block */}
        <div style={{ textAlign: "center", animation: "lo-appear 0.5s ease" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 52,
              color: "#f5f500",
              lineHeight: 0.9,
              letterSpacing: 6,
              textShadow: "4px 4px 0 #000",
            }}
          >
            LIGHTS
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 52,
              color: "#fff",
              lineHeight: 0.9,
              letterSpacing: 6,
              textShadow: "4px 4px 0 #000",
            }}
          >
            OUT
          </div>
        </div>

        {/* Difficulty selector */}
        <div style={{ display: "flex", gap: 0 }}>
          {DIFFICULTIES.map((d, i) => (
            <button
              key={i}
              onClick={() => start(i)}
              style={{
                padding: "6px 18px",
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 16,
                letterSpacing: 2,
                background:
                  difficulty === i && phase !== "idle" ? "#f5f500" : "#111",
                color: difficulty === i && phase !== "idle" ? "#000" : "#555",
                border: "2px solid #333",
                cursor: "pointer",
                borderRight: i < 2 ? "none" : "2px solid #333",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 14,
            color: "#666",
            letterSpacing: 2,
            alignItems: "center",
          }}
        >
          <div>
            MOVES{" "}
            <span
              style={{
                color: "#fff",
                fontSize: 22,
                fontFamily: "'Bebas Neue',sans-serif",
              }}
            >
              {moves}
            </span>
          </div>
          <div style={{ color: "#333" }}>|</div>
          <div>
            ON{" "}
            <span
              style={{
                color: "#f5f500",
                fontSize: 22,
                fontFamily: "'Bebas Neue',sans-serif",
              }}
            >
              {onCount}
            </span>
          </div>
          <div style={{ color: "#333" }}>|</div>
          <div>
            BEST{" "}
            <span
              style={{
                color: "#fff",
                fontSize: 18,
                fontFamily: "'Bebas Neue',sans-serif",
              }}
            >
              {best[difficulty] || "—"}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${SIZE},1fr)`,
            gap: 6,
            padding: 16,
            background: "#0d0d0d",
            border: "4px solid #111",
            boxShadow: "8px 8px 0 #000, inset 0 0 40px rgba(0,0,0,0.5)",
            animation: phase === "won" ? "lo-win 0.6s ease 3" : "none",
          }}
        >
          {grid.map((on, idx) => {
            const isHighlight = highlightNeighbors.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => click(idx)}
                style={{
                  width: 70,
                  height: 70,
                  background: on
                    ? `radial-gradient(circle at 35% 35%, #fff9aa, #f5f500)`
                    : "#111",
                  border: on ? "2px solid #f5f500" : "2px solid #222",
                  borderRadius: 3,
                  cursor: phase === "playing" ? "pointer" : "default",
                  boxShadow: on
                    ? "0 0 14px #f5f50066, 0 0 30px #f5f50033, inset 0 2px 0 rgba(255,255,255,0.6)"
                    : "inset 0 2px 4px rgba(0,0,0,0.5)",
                  transition:
                    "background 0.08s, box-shadow 0.08s, border-color 0.08s",
                  animation: isHighlight
                    ? on
                      ? "lo-on 0.12s ease"
                      : "lo-off 0.12s ease"
                    : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {on && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(255,255,200,0.4) 0%, transparent 60%)",
                      borderRadius: 1,
                    }}
                  />
                )}
                {/* Cell index (subtle) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    right: 5,
                    fontSize: 8,
                    color: on ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.08)",
                    fontFamily: "'Barlow Condensed',sans-serif",
                  }}
                >
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={undo}
            disabled={!history.length}
            style={{
              padding: "8px 20px",
              background: "#111",
              color: history.length ? "#888" : "#333",
              border: "2px solid #333",
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 16,
              letterSpacing: 2,
              cursor: history.length ? "pointer" : "default",
            }}
          >
            ↩ UNDO
          </button>
          <button
            onClick={() => start()}
            style={{
              padding: "8px 20px",
              background: "#222",
              color: "#666",
              border: "2px solid #333",
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 16,
              letterSpacing: 2,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#fff";
              e.target.style.borderColor = "#555";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#666";
              e.target.style.borderColor = "#333";
            }}
          >
            ↺ RESET
          </button>
        </div>

        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2 }}>
          TURN OFF ALL LIGHTS · CTRL+Z UNDO
        </div>

        {/* Idle overlay */}
        {phase === "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,10,0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              animation: "lo-appear 0.4s ease",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 60,
                color: "#f5f500",
                letterSpacing: 8,
                textShadow: "6px 6px 0 #000",
              }}
            >
              LIGHTS OUT
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#555",
                letterSpacing: 3,
                maxWidth: 360,
                textAlign: "center",
                lineHeight: 1.8,
              }}
            >
              點擊單元格即可切換其及其相鄰單元格的狀態。
              <br />
              關掉所有燈即可獲勝。
            </div>
            <button
              onClick={() => start()}
              style={{
                padding: "14px 40px",
                background: "#f5f500",
                color: "#000",
                border: "none",
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 22,
                letterSpacing: 4,
                cursor: "pointer",
                boxShadow: "5px 5px 0 #000",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#fff")}
              onMouseLeave={(e) => (e.target.style.background = "#f5f500")}
            >
              PLAY
            </button>
          </div>
        )}

        {/* Win overlay */}
        {phase === "won" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,10,0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              animation: "lo-appear 0.3s ease",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 52,
                color: "#f5f500",
                letterSpacing: 6,
                textShadow: "5px 5px 0 #000",
              }}
            >
              LIGHTS OUT!
            </div>
            <div style={{ fontSize: 16, color: "#888", letterSpacing: 3 }}>
              SOLVED IN{" "}
              <span
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontFamily: "'Bebas Neue',sans-serif",
                }}
              >
                {moves}
              </span>{" "}
              MOVES
            </div>
            <div style={{ fontSize: 14, color: "#f5f500", letterSpacing: 2 }}>
              SCORE {Math.max(0, 1000 - moves * 15)}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {DIFFICULTIES.map((d, i) => (
                <button
                  key={i}
                  onClick={() => start(i)}
                  style={{
                    padding: "10px 20px",
                    background: i === difficulty ? "#f5f500" : "#111",
                    color: i === difficulty ? "#000" : "#666",
                    border: "2px solid #333",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    letterSpacing: 2,
                    cursor: "pointer",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
