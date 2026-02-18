import { useState, useEffect, useRef } from "react";

const GRID = 20;
const CELL = 20;

export default function Snake({ onScore }) {
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([0, 1]);
  const [gameState, setGameState] = useState("ready"); // ready, playing, gameover
  const [score, setScore] = useState(0);
  const dirRef = useRef([0, 1]);

  const generateFood = (snakeBody) => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID),
        Math.floor(Math.random() * GRID),
      ];
    } while (snakeBody.some(([r, c]) => r === newFood[0] && c === newFood[1]));
    return newFood;
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const [dr, dc] = dirRef.current;
        const [hr, hc] = prev[0];
        const newHead = [hr + dr, hc + dc];

        // 撞牆或自己
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID ||
          newHead[1] < 0 ||
          newHead[1] >= GRID ||
          prev.some(([r, c]) => r === newHead[0] && c === newHead[1])
        ) {
          setGameState("gameover");
          onScore(score);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // 吃到食物
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [gameState, food, score]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        return;
      e.preventDefault();

      const dirs = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      const newDir = dirs[e.key];

      // 防止反向
      if (
        dirRef.current[0] + newDir[0] === 0 &&
        dirRef.current[1] + newDir[1] === 0
      )
        return;

      dirRef.current = newDir;
      setDirection(newDir);

      if (gameState === "ready") {
        setGameState("playing");
        setScore(0);
        setSnake([[10, 10]]);
        setFood([15, 15]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState]);

  const handleRestart = () => {
    setGameState("ready");
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection([0, 1]);
    dirRef.current = [0, 1];
    setScore(0);
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
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b" }}>
          分數: {score}
        </div>
        <button
          onClick={handleRestart}
          style={{
            padding: "0.5rem 1.25rem",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          重新開始
        </button>
      </div>

      <div
        style={{
          width: GRID * CELL,
          height: GRID * CELL,
          background: "#1e293b",
          borderRadius: "8px",
          position: "relative",
          border: "3px solid #475569",
        }}
      >
        {/* Snake */}
        {snake.map(([r, c], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c * CELL,
              top: r * CELL,
              width: CELL - 2,
              height: CELL - 2,
              background: i === 0 ? "#10b981" : "#34d399",
              borderRadius: i === 0 ? "4px" : "2px",
            }}
          />
        ))}

        {/* Food */}
        <div
          style={{
            position: "absolute",
            left: food[1] * CELL,
            top: food[0] * CELL,
            width: CELL - 2,
            height: CELL - 2,
            background: "#ef4444",
            borderRadius: "50%",
          }}
        />

        {/* Overlays */}
        {gameState === "ready" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: 600,
              textAlign: "center",
              padding: "1rem",
            }}
          >
            按方向鍵開始
          </div>
        )}

        {gameState === "gameover" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.8)",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "white" }}>
              遊戲結束
            </div>
            <div style={{ fontSize: "1.25rem", color: "white" }}>
              分數: {score}
            </div>
          </div>
        )}
      </div>

      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>使用方向鍵控制</div>
    </div>
  );
}
