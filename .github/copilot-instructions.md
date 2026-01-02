<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Robinhood UI Clone

This is a React + TypeScript project built with Vite that replicates the Robinhood stock trading app UI.

## Tech Stack
- React 18+ with TypeScript
- Vite for fast development and building
- lightweight-charts for interactive stock charts
- lucide-react for icons
- CSS modules for styling

## Project Structure
- `src/components/` - React components (Header, StockChart, Portfolio, Watchlist, TradingPanel)
- `src/data/` - Mock data for stocks, portfolio, and watchlist
- `src/types/` - TypeScript interfaces and types

## Design Guidelines
- Dark theme with black (#000000) background
- Primary green color: #00c805 (Robinhood green)
- Negative/sell color: #ff5000 (orange-red)
- Card backgrounds: #1a1a1a
- Border color: #2a2a2a
- Text colors: #ffffff (primary), #a0a0a0 (secondary), #6b6b6b (muted)

## Code Style
- Use functional components with hooks
- Keep components small and focused
- Use CSS files for styling (not inline styles)
- Follow TypeScript best practices with proper typing
