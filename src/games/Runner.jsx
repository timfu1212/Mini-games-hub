import { useState, useEffect, useRef } from "react";

const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.5;
const SPEED_INCREASE_SCORE = 100;
const PLAYER_SIZE = 40;
const GROUND = 0;
const JUMP_POWER = 12;
const GRAVITY = 0.6;
const GAME_HEIGHT = 300;

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.85; }
    94% { opacity: 1; }
    96% { opacity: 0.9; }
    97% { opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes neonPulse {
    0%, 100% { text-shadow: 0 0 4px #0ff, 0 0 10px #0ff, 0 0 20px #0ff; }
    50% { text-shadow: 0 0 2px #0ff, 0 0 6px #0ff; }
  }
  @keyframes groundScroll {
    0% { background-position: 0 0; }
    100% { background-position: -40px 0; }
  }
  @keyframes starScroll {
    0% { background-position: 0 0, 0 0; }
    100% { background-position: -200px 0, -100px 0; }
  }
  @keyframes shake {
    0%, 100% { transform: translate(0, 0); }
    20% { transform: translate(-3px, 2px); }
    40% { transform: translate(3px, -2px); }
    60% { transform: translate(-2px, -3px); }
    80% { transform: translate(2px, 3px); }
  }
`;

export default function Runner({ onScore }) {
  const [gameState, setGameState] = useState("ready");
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [shaking, setShaking] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);

  const requestRef = useRef();
  const gameOverRef = useRef(false);
  const playerYRef = useRef(0);
  const velocityRef = useRef(0);
  const isJumpingRef = useRef(false);
  const gameWidthRef = useRef(window.innerWidth);

  // Keep gameWidth in sync with window resize
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setGameWidth(w);
      gameWidthRef.current = w;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    gameOverRef.current = false;
    playerYRef.current = 0;
    velocityRef.current = 0;
    isJumpingRef.current = false;

    let lastObstacleTime = 0;
    let currentSpeed = INITIAL_SPEED;
    let currentScore = 0;
    let localObstacles = [];

    const gameLoop = (timestamp) => {
      if (gameOverRef.current) return;

      // ── Physics ──────────────────────────────────────────────
      if (isJumpingRef.current || playerYRef.current > GROUND) {
        velocityRef.current -= GRAVITY;
        playerYRef.current += velocityRef.current;

        if (playerYRef.current <= GROUND) {
          playerYRef.current = GROUND;
          velocityRef.current = 0;
          isJumpingRef.current = false;
        }
        setPlayerY(playerYRef.current);
      }

      // ── Spawn obstacles ──────────────────────────────────────
      if (timestamp - lastObstacleTime > 1800 + Math.random() * 800) {
        const newObs = {
          x: gameWidthRef.current, // spawn at current full width
          height: 30 + Math.random() * 50,
          id: Date.now(),
          color: ["#f0f", "#0ff", "#ff0"][Math.floor(Math.random() * 3)],
        };
        localObstacles = [...localObstacles, newObs];
        lastObstacleTime = timestamp;
      }

      // ── Move + collision ─────────────────────────────────────
      localObstacles = localObstacles
        .map((obs) => ({ ...obs, x: obs.x - currentSpeed }))
        .filter((obs) => obs.x > -50);

      const py = playerYRef.current;

      for (const obs of localObstacles) {
        const playerLeft = 64;
        const playerRight = 96;
        const obsLeft = obs.x + 2;
        const obsRight = obs.x + 26;
        const horizOverlap = playerRight > obsLeft && playerLeft < obsRight;

        if (horizOverlap && py < obs.height) {
          gameOverRef.current = true;
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
          setObstacles([]);
          setGameState("gameover");
          setHighScore((h) => Math.max(h, currentScore));
          if (onScore) onScore(currentScore);
          return;
        }
      }

      setObstacles([...localObstacles]);

      // ── Score + speed ────────────────────────────────────────
      currentScore += 1;
      setScore(currentScore);
      if (currentScore % SPEED_INCREASE_SCORE === 0 && currentScore > 0) {
        currentSpeed = Math.min(currentSpeed + SPEED_INCREMENT, 15);
        setGameSpeed(currentSpeed);
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]);

  const doJump = () => {
    if (playerYRef.current === GROUND && !isJumpingRef.current) {
      isJumpingRef.current = true;
      velocityRef.current = JUMP_POWER;
    }
  };

  const handleClick = () => {
    if (gameState === "ready") {
      setGameState("playing");
      setScore(0);
      setObstacles([]);
      setPlayerY(0);
      setGameSpeed(INITIAL_SPEED);
    } else if (gameState === "playing") {
      doJump();
    }
  };

  const handleRestart = (e) => {
    e.stopPropagation();
    playerYRef.current = 0;
    velocityRef.current = 0;
    isJumpingRef.current = false;
    gameOverRef.current = false;
    setGameState("ready");
    setPlayerY(0);
    setScore(0);
    setObstacles([]);
    setGameSpeed(INITIAL_SPEED);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "ready") {
          setGameState("playing");
          setScore(0);
          setObstacles([]);
          setPlayerY(0);
          setGameSpeed(INITIAL_SPEED);
        } else if (gameState === "playing") {
          doJump();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState]);

  const playerTrail = [
    { opacity: 0.3, offset: 8 },
    { opacity: 0.15, offset: 16 },
  ];

  return (
    <>
      <style>{fontStyle}</style>
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontFamily: "'Press Start 2P', monospace",
          background: "#050510",
          margin: 0,
          padding: "24px 0",
          boxSizing: "border-box",
          animation: shaking ? "shake 0.4s ease" : "none",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: "22px",
            color: "#0ff",
            letterSpacing: "4px",
            animation: "neonPulse 2s ease-in-out infinite",
            marginBottom: "4px",
          }}
        >
          CYBER RUN
        </div>

        {/* Score bar */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            fontSize: "9px",
            color: "#888",
            marginBottom: "4px",
          }}
        >
          <span>
            SCORE{" "}
            <span style={{ color: "#0ff" }}>
              {String(score).padStart(6, "0")}
            </span>
          </span>
          <span>
            BEST{" "}
            <span style={{ color: "#f0f" }}>
              {String(highScore).padStart(6, "0")}
            </span>
          </span>
          <span>
            SPD <span style={{ color: "#ff0" }}>{gameSpeed.toFixed(1)}</span>
          </span>
        </div>

        {/* Game canvas — full viewport width */}
        <div
          onClick={handleClick}
          style={{
            width: "100vw",
            height: GAME_HEIGHT,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            borderTop: "2px solid #0ff",
            borderBottom: "2px solid #0ff",
            boxShadow: "0 0 30px #0ff4, inset 0 0 40px #00001a",
            background: "#050510",
            animation: "flicker 8s infinite",
          }}
        >
          {/* Starfield */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(1px 1px at 5% 20%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 15% 60%, #aaf 0%, transparent 100%), radial-gradient(1px 1px at 25% 10%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 35% 75%, #faf 0%, transparent 100%), radial-gradient(1px 1px at 45% 40%, #aff 0%, transparent 100%), radial-gradient(1px 1px at 55% 85%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 65% 25%, #aaf 0%, transparent 100%), radial-gradient(1px 1px at 75% 55%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 85% 15%, #faf 0%, transparent 100%), radial-gradient(1px 1px at 95% 70%, #aff 0%, transparent 100%)",
              backgroundSize: "300px 300px",
              opacity: 0.6,
              animation:
                gameState === "playing"
                  ? "starScroll 4s linear infinite"
                  : "none",
            }}
          />

          {/* Scanlines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "60px",
              background:
                "linear-gradient(180deg, transparent, rgba(0,255,255,0.025), transparent)",
              zIndex: 11,
              pointerEvents: "none",
              animation:
                gameState === "playing"
                  ? "scanline 3s linear infinite"
                  : "none",
            }}
          />

          {/* Ground */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(180deg, #0a0a2e 0%, #050510 100%)",
              borderTop: "2px solid #0ff",
              boxShadow: "0 -4px 20px #0ff4",
              animation:
                gameState === "playing"
                  ? "groundScroll 0.5s linear infinite"
                  : "none",
            }}
          />

          {/* Player trail */}
          {gameState === "playing" &&
            playerTrail.map((t, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${60 - t.offset}px`,
                  bottom: `${60 + playerY}px`,
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  background: "#0ff",
                  opacity: t.opacity,
                  borderRadius: "3px",
                  filter: "blur(2px)",
                }}
              />
            ))}

          {/* Player */}
          <div
            style={{
              position: "absolute",
              left: "60px",
              bottom: `${60 + playerY}px`,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              background: "linear-gradient(135deg, #0ff 0%, #00aaff 100%)",
              borderRadius: "3px",
              border: "2px solid #fff",
              boxShadow: "0 0 10px #0ff, 0 0 20px #0ff4",
              zIndex: 2,
            }}
          >
            <div
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "7px",
                  width: "8px",
                  height: "8px",
                  background: "#050510",
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "7px",
                  width: "8px",
                  height: "8px",
                  background: "#050510",
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "16px",
                  height: "4px",
                  background: "#050510",
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>

          {/* Obstacles */}
          {obstacles.map((obs) => (
            <div key={obs.id}>
              <div
                style={{
                  position: "absolute",
                  left: `${obs.x - 4}px`,
                  bottom: "58px",
                  width: "38px",
                  height: `${obs.height + 8}px`,
                  background: obs.color,
                  opacity: 0.15,
                  filter: "blur(8px)",
                  borderRadius: "4px",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${obs.x}px`,
                  bottom: "60px",
                  width: "28px",
                  height: `${obs.height}px`,
                  background: `linear-gradient(180deg, ${obs.color} 0%, ${obs.color}88 100%)`,
                  border: `2px solid ${obs.color}`,
                  boxShadow: `0 0 8px ${obs.color}, 0 0 16px ${obs.color}44`,
                  borderRadius: "2px",
                  zIndex: 2,
                }}
              >
                {Array.from({ length: Math.floor(obs.height / 12) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: `${(i + 1) * 12}px`,
                        height: "1px",
                        background: "rgba(0,0,0,0.4)",
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          ))}

          {/* Game Over */}
          {gameState === "gameover" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,5,16,0.88)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  color: "#f0f",
                  letterSpacing: "3px",
                  textShadow: "0 0 10px #f0f, 0 0 20px #f0f",
                }}
              >
                GAME OVER
              </div>
              <div style={{ fontSize: "8px", color: "#888" }}>
                SCORE{" "}
                <span style={{ color: "#0ff" }}>
                  {String(score).padStart(6, "0")}
                </span>
              </div>
              {score >= highScore && score > 0 && (
                <div
                  style={{
                    fontSize: "7px",
                    color: "#ff0",
                    textShadow: "0 0 8px #ff0",
                    animation: "blink 1s infinite",
                  }}
                >
                  ★ NEW BEST ★
                </div>
              )}
              <button
                onClick={handleRestart}
                style={{
                  marginTop: "8px",
                  padding: "10px 24px",
                  background: "transparent",
                  color: "#0ff",
                  border: "2px solid #0ff",
                  borderRadius: "2px",
                  fontSize: "8px",
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: "pointer",
                  letterSpacing: "2px",
                  boxShadow: "0 0 10px #0ff4",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#0ff";
                  e.target.style.color = "#050510";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#0ff";
                }}
              >
                RETRY
              </button>
            </div>
          )}

          {/* Start prompt */}
          {gameState === "ready" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#0ff",
                  letterSpacing: "2px",
                  animation: "blink 1.2s infinite",
                  textShadow: "0 0 8px #0ff",
                }}
              >
                PRESS SPACE TO START
              </div>
              <div style={{ fontSize: "7px", color: "#666" }}>
                OR CLICK TO PLAY
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div
          style={{
            fontSize: "7px",
            color: "#444",
            letterSpacing: "1px",
            marginTop: "4px",
          }}
        >
          [SPACE] / CLICK — JUMP
        </div>
      </div>
    </>
  );
}
