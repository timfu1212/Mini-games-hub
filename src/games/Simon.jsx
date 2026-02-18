import { useState, useEffect } from "react";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

export default function Simon({ onScore }) {
  const [sequence, setSequence] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameState, setGameState] = useState("ready"); // ready, showing, player, gameover

  const playSequence = async (seq) => {
    setGameState("showing");
    for (const color of seq) {
      setActiveColor(color);
      await new Promise((r) => setTimeout(r, 500));
      setActiveColor(null);
      await new Promise((r) => setTimeout(r, 300));
    }
    setGameState("player");
  };

  const handleStart = () => {
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
    setUserSeq([]);
    setPlaying(true);
    setGameState("showing");
    playSequence([firstColor]);
  };

  const handleColorClick = (index) => {
    if (gameState !== "player") return;

    const newUserSeq = [...userSeq, index];
    setUserSeq(newUserSeq);
    setActiveColor(index);
    setTimeout(() => setActiveColor(null), 300);

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      setGameState("gameover");
      setPlaying(false);
      onScore(sequence.length - 1);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      onScore(sequence.length);
      setTimeout(() => {
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setUserSeq([]);
        playSequence(nextSeq);
      }, 1000);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "0.9rem",
            color: "#64748b",
            marginBottom: "0.5rem",
          }}
        >
          {gameState === "ready" && "準備開始"}
          {gameState === "showing" && "記住順序..."}
          {gameState === "player" && "輪到你了！"}
          {gameState === "gameover" && "遊戲結束"}
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b" }}>
          第 {sequence.length} 關
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 120px)",
          gap: "15px",
        }}
      >
        {COLORS.map((color, i) => (
          <div
            key={i}
            onClick={() => handleColorClick(i)}
            style={{
              width: "120px",
              height: "120px",
              background: color,
              borderRadius: "12px",
              cursor: gameState === "player" ? "pointer" : "default",
              opacity: activeColor === i ? 1 : 0.6,
              transform: activeColor === i ? "scale(0.95)" : "scale(1)",
              transition: "all 0.1s",
              boxShadow:
                activeColor === i
                  ? "0 0 20px rgba(0,0,0,0.3)"
                  : "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>

      {gameState === "ready" && (
        <button
          onClick={handleStart}
          style={{
            padding: "1rem 2.5rem",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          開始遊戲
        </button>
      )}

      {gameState === "gameover" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.25rem",
              color: "#64748b",
              marginBottom: "1rem",
            }}
          >
            成功記住 {sequence.length - 1} 個順序！
          </div>
          <button
            onClick={handleStart}
            style={{
              padding: "0.75rem 2rem",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            再玩一次
          </button>
        </div>
      )}

      <div
        style={{ fontSize: "0.9rem", color: "#64748b", textAlign: "center" }}
      >
        記住閃爍順序並按照順序點擊
      </div>
    </div>
  );
}
