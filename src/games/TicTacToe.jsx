import { useState, useEffect } from "react";

export default function TicTacToe({ onScore }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState([]);

  const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (squares) => {
    for (const [a, b, c] of LINES) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        setWinLine([a, b, c]);
        return squares[a];
      }
    }
    return squares.includes(null) ? null : "draw";
  };

  const minimax = (squares, isMax) => {
    const w = checkWinner(squares);
    if (w === "O") return 10;
    if (w === "X") return -10;
    if (w === "draw") return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          best = Math.max(best, minimax(squares, false));
          squares[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          best = Math.min(best, minimax(squares, true));
          squares[i] = null;
        }
      }
      return best;
    }
  };

  const getBestMove = (squares) => {
    let bestVal = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        const moveVal = minimax(squares, false);
        squares[i] = null;
        if (moveVal > bestVal) {
          bestMove = i;
          bestVal = moveVal;
        }
      }
    }
    return bestMove;
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      setTimeout(() => {
        const move = getBestMove([...board]);
        if (move !== -1) {
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          const w = checkWinner(newBoard);
          if (w) {
            setWinner(w);
            if (w === "X") onScore(100);
          }
          setIsPlayerTurn(true);
        }
      }, 500);
    }
  }, [isPlayerTurn, winner]);

  const handleClick = (i) => {
    if (board[i] || !isPlayerTurn || winner) return;

    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      if (w === "X") onScore(100);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinLine([]);
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
          {winner === "X"
            ? "🎉 你贏了！"
            : winner === "O"
              ? "🤖 AI 獲勝"
              : winner === "draw"
                ? "平局"
                : isPlayerTurn
                  ? "你的回合 (X)"
                  : "AI 思考中..."}
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
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "10px",
          background: "white",
          padding: "15px",
          borderRadius: "12px",
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "100px",
              height: "100px",
              background: winLine.includes(i) ? "#fef3c7" : "#f8fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              fontWeight: 700,
              cursor: !cell && isPlayerTurn && !winner ? "pointer" : "default",
              color: cell === "X" ? "#3b82f6" : "#ef4444",
            }}
          >
            {cell}
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
        你是 X，AI 是 O
      </div>
    </div>
  );
}
