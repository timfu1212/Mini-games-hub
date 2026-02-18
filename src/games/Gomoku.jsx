import { useState } from "react";

const BOARD_SIZE = 15;

export default function Gomoku({ onScore }) {
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0)),
  );
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1: 黑, 2: 白
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const checkWin = (r, c, player) => {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      const line = [[r, c]];

      // 正向
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i,
          nc = c + dc * i;
        if (
          nr < 0 ||
          nr >= BOARD_SIZE ||
          nc < 0 ||
          nc >= BOARD_SIZE ||
          board[nr][nc] !== player
        )
          break;
        count++;
        line.push([nr, nc]);
      }

      // 反向
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i,
          nc = c - dc * i;
        if (
          nr < 0 ||
          nr >= BOARD_SIZE ||
          nc < 0 ||
          nc >= BOARD_SIZE ||
          board[nr][nc] !== player
        )
          break;
        count++;
        line.unshift([nr, nc]);
      }

      if (count >= 5) {
        setWinningLine(line);
        return true;
      }
    }
    return false;
  };

  const handleClick = (r, c) => {
    if (board[r][c] !== 0 || winner) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);

    if (checkWin(r, c, currentPlayer)) {
      setWinner(currentPlayer);
      onScore(currentPlayer === 1 ? 100 : 50);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const handleRestart = () => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(0)),
    );
    setCurrentPlayer(1);
    setWinner(null);
    setWinningLine([]);
  };

  const isWinningCell = (r, c) =>
    winningLine.some(([wr, wc]) => wr === r && wc === c);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b" }}>
          {winner
            ? `${winner === 1 ? "⚫ 黑子" : "⚪ 白子"}獲勝！`
            : `輪到 ${currentPlayer === 1 ? "⚫ 黑子" : "⚪ 白子"}`}
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
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 30px)`,
          gap: "0",
          background: "#d4a574",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid #8b6f47",
                cursor: cell === 0 && !winner ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                background: isWinningCell(r, c) ? "#fef3c7" : "transparent",
              }}
            >
              {cell === 1 && (
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#1e293b",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              )}
              {cell === 2 && (
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
            </div>
          )),
        )}
      </div>

      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
        雙人對弈，先連成五子獲勝
      </div>
    </div>
  );
}
