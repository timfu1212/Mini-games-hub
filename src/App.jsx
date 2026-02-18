import { useState } from "react";
import { useEffect } from "react";
import Runner from "./games/Runner";
import Game2048 from "./games/Game2048";
import Memory from "./games/Memory";
import Gomoku from "./games/Gomoku";
import Reaction from "./games/Reaction";
import TicTacToe from "./games/TicTacToe";
import Simon from "./games/Simon";
import Snake from "./games/Snake";

const GAMES = [
  {
    id: "runner",
    name: "跑酷英雄",
    icon: "🏃",
    component: Runner,
    desc: "躲避障礙物，跑得越遠越好",
  },
  {
    id: "2048",
    name: "2048",
    icon: "🧩",
    component: Game2048,
    desc: "合併數字達到 2048",
  },
  {
    id: "memory",
    name: "記憶翻牌",
    icon: "🃏",
    component: Memory,
    desc: "找出所有配對卡片",
  },
  {
    id: "gomoku",
    name: "五子棋",
    icon: "⚫",
    component: Gomoku,
    desc: "先連成五子獲勝",
  },
  {
    id: "reaction",
    name: "反應測試",
    icon: "🎯",
    component: Reaction,
    desc: "打地鼠風格反應訓練",
  },
  {
    id: "tictactoe",
    name: "井字棋",
    icon: "⭕",
    component: TicTacToe,
    desc: "AI 對戰經典遊戲",
  },
  {
    id: "simon",
    name: "色彩記憶",
    icon: "🎨",
    component: Simon,
    desc: "Simon Says 記憶挑戰",
  },
  {
    id: "snake",
    name: "貪食蛇",
    icon: "🐍",
    component: Snake,
    desc: "經典街機遊戲",
  },
];

export default function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("miniGamesScores");
    return saved ? JSON.parse(saved) : {};
  });
  // 位元滑落元件
  const BitRain = () => {
    const [bits, setBits] = useState([]);

    useEffect(() => {
      const createBit = () => {
        const bitCount = 30; // 位元數量
        const newBits = [];

        for (let i = 0; i < bitCount; i++) {
          newBits.push({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 10,
            content: Math.random() > 0.5 ? "0" : "1",
            size: 16 + Math.floor(Math.random() * 16),
          });
        }
        setBits(newBits);
      };

      createBit();

      // 每隔一段時間重新產生位置（讓動畫持續）
      const interval = setInterval(() => {
        setBits((prev) =>
          prev.map((bit) => ({
            ...bit,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 10,
          })),
        );
      }, 10000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="bit-rain">
        {bits.map((bit) => (
          <div
            key={bit.id}
            className="bit"
            style={{
              left: `${bit.left}%`,
              animationDelay: `${bit.delay}s`,
              animationDuration: `${bit.duration}s`,
              fontSize: `${bit.size}px`,
            }}
          >
            <span className="bit-content">{bit.content}</span>
            <span className="bit-content" style={{ marginLeft: "2px" }}>
              {bit.content}
            </span>
          </div>
        ))}
      </div>
    );
  };
  // 在 App 元件中加入 useEffect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const saveScore = (gameId, score) => {
    const newScores = {
      ...scores,
      [gameId]: Math.max(scores[gameId] || 0, score),
    };
    setScores(newScores);
    localStorage.setItem("miniGamesScores", JSON.stringify(newScores));
  };

  const GameComponent = currentGame?.component;

  if (currentGame) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#03050a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            background: "rgba(5, 10, 20, 0.9)", // ✅ 半透明深色
            borderBottom: "1px solid #00ffff40", // ✅ RGB 色邊框
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backdropFilter: "blur(10px)", // ✅ 毛玻璃效果
          }}
        >
          <button
            onClick={() => setCurrentGame(null)}
            className="back-btn" // ✅ 套用 back-btn class
            style={{
              padding: "0.5rem 1.5rem",
              background: "rgba(0, 255, 255, 0.1)",
              border: "2px solid #00ffff",
              borderRadius: "8px",
              color: "#00ffff",
              fontWeight: 600,
              cursor: "pointer",
              textShadow: "0 0 10px #00ffff",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
            }}
          >
            ← 返回大廳
          </button>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #00ffff, #ff00ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {currentGame.icon} {currentGame.name}
          </div>
          <div
            style={{
              fontSize: "1rem",
              color: "#00ffff",
              textShadow: "0 0 10px #00ffff",
            }}
          >
            最高分: {scores[currentGame.id] || 0}
          </div>
        </header>
        <GameComponent onScore={(s) => saveScore(currentGame.id, s)} />
      </div>
    );
  }

  return (
    <>
      <BitRain />
      {/* 移除這個空的 div ❌ */}
      {/* <div style={{ minHeight: "100vh", padding: "3rem 1.5rem", position: "relative", zIndex: 2 }}></div> */}

      {/* 保留這個主要的內容 div */}
      <div
        style={{
          minHeight: "100vh",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <header style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem",
                textShadow: "0 0 40px rgba(129, 140, 248, 0.3)",
              }}
            >
              🎮 Mini Games Hub
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
              8 款精選小遊戲，隨時開玩
            </p>
          </header>

          {/* Games Grid - 保持不變 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => setCurrentGame(game)}
                className="game-card"
                style={{
                  borderRadius: "16px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(148, 163, 184, 0.1)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(129, 140, 248, 0.2), 0 0 0 1px rgba(129, 140, 248, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(148, 163, 184, 0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
                  {game.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "#f1f5f9",
                  }}
                >
                  {game.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#94a3b8",
                    marginBottom: "1rem",
                  }}
                >
                  {game.desc}
                </p>
                {scores[game.id] > 0 && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      background: "rgba(129, 140, 248, 0.2)",
                      borderRadius: "999px",
                      fontSize: "0.85rem",
                      color: "#818cf8",
                      border: "1px solid rgba(129, 140, 248, 0.3)",
                    }}
                  >
                    最高分: {scores[game.id]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer
            style={{
              textAlign: "center",
              marginTop: "4rem",
              color: "#64748b",
              fontSize: "0.9rem",
            }}
          >
            <p>所有遊戲均為單機版本，資料儲存於瀏覽器本地</p>
            <p style={{ marginTop: "0.5rem" }}>
              Made with React · Deployed on GitHub Pages
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
