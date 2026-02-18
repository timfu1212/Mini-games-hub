# 🎮 Mini Games Hub | 8款精選小遊戲

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![License](https://img.shields.io/badge/license-MIT-green)

<div align="center">
  <p><em>⚡ 8款經典小遊戲，隨時開玩 ⚡</em></p>
</div>

## 🎯 專案簡介

**Mini Games Hub** 是一個整合多款經典小遊戲的 React 應用，採用 RGB 電競風格設計，所有遊戲均為單機版本，分數儲存在瀏覽器本地。

### ✨ 特色功能
- 🎮 **8款精選遊戲**：跑酷、2048、記憶翻牌、五子棋、反應測試、井字棋、色彩記憶、貪食蛇
- 🏆 **本地高分記錄**：使用 localStorage 儲存最高分數
- 🎨 **RGB 電競風格**：霓虹邊框、發光文字、像素風網格
- 🌧️ **位元滑落動畫**：動態背景效果
- 📱 **RWD 響應式**：手機、平板、電腦都能玩

## 🚀 線上體驗

👉 [Mini Games Hub 立即體驗](https://timfu1212.github.io/Mini-games-hub)

## 🛠️ 技術棧

- **前端框架**：React 19
- **建置工具**：Vite 8
- **語言**：JavaScript (ES6+)
- **樣式**：CSS3 (客製化電競風格)
- **部署**：GitHub Pages
- **版本控制**：Git

## 📁 專案結構
mini-games-hub/
├── public/ # 靜態資源
├── src/
│ ├── games/ # 遊戲元件
│ │ ├── Game2048.jsx
│ │ ├── Gomoku.jsx
│ │ ├── Memory.jsx
│ │ ├── Reaction.jsx
│ │ ├── Runner.jsx
│ │ ├── Simon.jsx
│ │ ├── Snake.jsx
│ │ └── TicTacToe.jsx
│ ├── App.jsx # 主應用
│ ├── main.jsx # 進入點
│ └── styles.css # 電競風格樣式
├── index.html
├── package.json
├── vite.config.js
└── README.md


## 🎮 遊戲列表

| 遊戲 | 說明 | 控制方式 |
|------|------|----------|
| 🏃 **跑酷英雄** | 躲避障礙物，跑得越遠越好 | 點擊 / 空白鍵 |
| 🧩 **2048** | 合併數字達到 2048 | 方向鍵 |
| 🃏 **記憶翻牌** | 找出所有配對卡片 | 點擊卡片 |
| ⚫ **五子棋** | 先連成五子獲勝 | 點擊棋盤 |
| 🎯 **反應測試** | 打地鼠風格反應訓練 | 點擊目標 |
| ⭕ **井字棋** | AI 對戰經典遊戲 | 點擊格子 |
| 🎨 **色彩記憶** | Simon Says 記憶挑戰 | 點擊按鈕 |
| 🐍 **貪食蛇** | 經典街機遊戲 | 方向鍵 |

## 🚀 快速開始

### 環境需求
- Node.js 18+
- npm 9+

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/timfu1212/Mini-games-hub.git
cd Mini-games-hub

# 2. 安裝相依套件
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 打開瀏覽器
http://localhost:5173

# 建置 production 版本
npm run build

# 部署到 GitHub Pages
npm run deploy
