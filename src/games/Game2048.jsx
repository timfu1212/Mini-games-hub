import { useState, useEffect } from "react";

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const CELL_GAP = 12;

const COLORS = {
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
};

export default function Game2048({ onScore }) {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGrid = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  };

  useEffect(() => {
    setGrid(initGrid());
  }, []);

  const addRandomTile = (g) => {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = (direction) => {
    if (gameOver) return;
    let moved = false;
    let newScore = score;
    const newGrid = grid.map((row) => [...row]);

    const slideRow = (row) => {
      const filtered = row.filter((v) => v !== 0);
      const merged = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          newScore += filtered[i] * 2;
          moved = true;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      return merged;
    };

    if (direction === "left") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const newRow = slideRow(newGrid[r]);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
    } else if (direction === "right") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const newRow = slideRow([...newGrid[r]].reverse()).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
    } else if (direction === "up") {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map((row) => row[c]);
        const newCol = slideRow(col);
        if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
        newGrid.forEach((row, r) => (row[c] = newCol[r]));
      }
    } else if (direction === "down") {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map((row) => row[c]);
        const newCol = slideRow([...col].reverse()).reverse();
        if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
        newGrid.forEach((row, r) => (row[c] = newCol[r]));
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      onScore(newScore);

      // Check game over
      if (!canMove(newGrid)) {
        setGameOver(true);
      }
    }
  };

  const canMove = (g) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const dir = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
        }[e.key];
        move(dir);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver, score]);

  const handleRestart = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
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
        <button
          onClick={handleRestart}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          重新開始
        </button>
      </div>

      <div
        style={{
          width: GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP,
          height: GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP,
          background: "#bbada0",
          borderRadius: "8px",
          padding: CELL_GAP,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
          position: "relative",
        }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: val === 0 ? "#cdc1b4" : COLORS[val] || "#3c3a32",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize:
                  val >= 1024 ? "1.75rem" : val >= 128 ? "2rem" : "2.25rem",
                fontWeight: 700,
                color: val >= 8 ? "white" : "#776e65",
                transition: "transform 0.1s",
              }}
            >
              {val !== 0 && val}
            </div>
          )),
        )}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(238, 228, 218, 0.7)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#776e65",
            }}
          >
            Game Over!
          </div>
        )}
      </div>

      <div
        style={{ fontSize: "0.9rem", color: "#64748b", textAlign: "center" }}
      >
        使用方向鍵移動
      </div>
    </div>
  );
}
