# Biomed Assistant

A React-based biomedical research assistant powered by Claude AI (Anthropic) with BioMCP integration.

## Features

- Query biomedical databases (PubMed, ClinicalTrials.gov, MyVariant.info)
- Natural language conversation interface
- Real-time research assistance
- Modern, responsive UI

## Getting Started

### Installation

```bash
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

You can get your API key from [Anthropic Console](https://console.anthropic.com/).

### Development

To run both the frontend and backend together:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
biomed-assistant/
├── src/
│   ├── components/
│   │   ├── BiomedicalAssistant.jsx
│   │   ├── Header.jsx
│   │   ├── MessageList.jsx
│   │   ├── InputArea.jsx
│   │   └── ExampleQueries.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   └── index.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Technologies

- React 18
- Vite
- Lucide React (icons)
- Tailwind CSS (via CDN classes)
- Express.js (backend proxy)
- Anthropic Claude API

