import { useState, useEffect } from "react";

const ICONS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🥝", "🍒"];

export default function Memory({ onScore }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const deck = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);
    setCards(deck.map((icon, i) => ({ id: i, icon })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].icon === cards[second].icon) {
        setMatched((prev) => [...prev, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true);
      onScore(1000 - moves * 10);
    }
  }, [matched]);

  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;
    setFlipped((prev) => [...prev, index]);
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
          步數: {moves}
        </div>
        <button
          onClick={initGame}
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
          gridTemplateColumns: "repeat(4, 90px)",
          gap: "12px",
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            onClick={() => handleFlip(i)}
            style={{
              width: "90px",
              height: "90px",
              background:
                flipped.includes(i) || matched.includes(i)
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#e2e8f0",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              cursor: matched.includes(i) ? "default" : "pointer",
              transition: "transform 0.2s",
              userSelect: "none",
            }}
            onMouseEnter={(e) =>
              !matched.includes(i) &&
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {(flipped.includes(i) || matched.includes(i)) && card.icon}
          </div>
        ))}
      </div>

      {gameWon && (
        <div
          style={{
            padding: "1.5rem 2rem",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#10b981",
              marginBottom: "0.5rem",
            }}
          >
            🎉 恭喜過關！
          </div>
          <div style={{ fontSize: "1rem", color: "#64748b" }}>
            總共使用 {moves} 步
          </div>
        </div>
      )}
    </div>
  );
}
