# Robinhood UI Clone

A modern stock trading app UI clone built with React, TypeScript, and Vite. This project replicates the sleek dark-themed interface of Robinhood with interactive stock charts, portfolio management, and trading functionality.

![Robinhood Clone](https://img.shields.io/badge/React-18+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![Vite](https://img.shields.io/badge/Vite-7+-purple)

## Features

- 📈 **Interactive Stock Charts** - Real-time looking charts with lightweight-charts library
- 💼 **Portfolio View** - Track your holdings with profit/loss indicators
- 📋 **Watchlist** - Monitor stocks you're interested in
- 💰 **Trading Panel** - Buy/sell interface with market and limit orders
- 🌙 **Dark Theme** - Authentic Robinhood dark mode design
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **lightweight-charts** - TradingView's charting library
- **lucide-react** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header with search
│   ├── StockChart.tsx  # Interactive price chart
│   ├── Portfolio.tsx   # Portfolio holdings list
│   ├── Watchlist.tsx   # Stock watchlist
│   └── TradingPanel.tsx # Buy/sell order panel
├── data/
│   └── mockData.ts     # Sample stock data
├── types/
│   └── index.ts        # TypeScript interfaces
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Design System

| Element | Color |
|---------|-------|
| Background | `#000000` |
| Card Background | `#1a1a1a` |
| Border | `#2a2a2a` |
| Primary Green | `#00c805` |
| Negative Red | `#ff5000` |
| Primary Text | `#ffffff` |
| Secondary Text | `#a0a0a0` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

This project is for educational purposes only. Robinhood is a trademark of Robinhood Markets, Inc.
