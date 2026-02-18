import { useState, useEffect } from "react";

export default function Reaction({ onScore }) {
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState("ready"); // ready, playing, ended

  useEffect(() => {
    if (gameState !== "playing") return;

    const moleInterval = setInterval(() => {
      const newMoles = Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newMoles[randomIndex] = true;
      setMoles(newMoles);

      setTimeout(() => {
        setMoles(Array(9).fill(false));
      }, 800);
    }, 1000);

    return () => clearInterval(moleInterval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("ended");
          onScore(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score]);

  const handleHit = (index) => {
    if (moles[index]) {
      setScore((prev) => prev + 10);
      setMoles((prev) => prev.map((m, i) => (i === index ? false : m)));
    }
  };

  const handleStart = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setMoles(Array(9).fill(false));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              marginBottom: "0.25rem",
            }}
          >
            分數
          </div>
          <div
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b" }}
          >
            {score}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              marginBottom: "0.25rem",
            }}
          >
            剩餘時間
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: timeLeft <= 5 ? "#ef4444" : "#10b981",
            }}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "15px",
          padding: "2rem",
          background: "white",
          borderRadius: "12px",
        }}
      >
        {moles.map((active, i) => (
          <div
            key={i}
            onClick={() => handleHit(i)}
            style={{
              width: "100px",
              height: "100px",
              background: active ? "#ef4444" : "#e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              transition: "transform 0.1s, background 0.2s",
              transform: active ? "scale(1.1)" : "scale(1)",
            }}
          >
            {active && "🐹"}
          </div>
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

      {gameState === "ended" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            遊戲結束！
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              color: "#64748b",
              marginBottom: "1rem",
            }}
          >
            最終分數: {score}
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
    </div>
  );
}
