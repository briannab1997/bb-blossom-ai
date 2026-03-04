# BlossomAI

A conversational AI companion with a warm, adaptive personality. BlossomAI helps with a wide range of everyday topics — from career questions and creative blocks to relationship dynamics, habit-building, and financial decisions — delivered through a polished, real-time chat interface.

> **Status:** Early stage · Actively developed

---

## What Blossom Can Help With

BlossomAI is designed to be a thoughtful, versatile companion. Topics include:

| Category | Examples |
|---|---|
| 💼 Career & Work | Career direction, job searches, workplace dynamics, interviews |
| 📚 School & Productivity | Study strategies, procrastination, time management, burnout |
| 💔 Relationships | Communication, boundaries, conflict, difficult people |
| 🎨 Creativity | Brainstorming, creative blocks, project ideas, writing |
| 🌱 Habits & Growth | Building routines, motivation, self-discipline, goal setting |
| 🧠 Mental Wellness | Stress, anxiety, overwhelm (with professional referral when appropriate) |
| 💰 Money & Finances | Budgeting basics, saving habits, financial decisions |
| 🎯 Decision-Making | Thinking through big choices, pros/cons, next steps |

---

## Features

- **Streaming responses** — tokens stream in real-time (SSE), like a live conversation
- **Conversation memory** — full message history is sent to the API for multi-turn context
- **4 tone modes** — switch between Soft 🌸, Sassy 🔥, Pro 💼, and Wise 🌙 at any time; the UI accent color shifts with each tone
- **Session history** — past conversations are saved locally and accessible from the sidebar
- **Voice input** — speak your message via the Web Speech API (browser permitting)
- **Export chat** — download any conversation as a `.md` file
- **Copy messages** — copy any response to clipboard with one click
- **Dark mode** — deep purple theme, preference persisted across sessions
- **Keyboard shortcuts** — `⌘K` clear · `⌘D` dark mode · `⌘E` export · `⌘B` sidebar
- **Mobile responsive** — works across screen sizes with reduced-motion support

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS, HTML5, CSS3 (no framework) |
| AI | OpenAI `gpt-4o-mini` via streaming SSE |
| Backend | Vercel Serverless Functions (`/api/blossom.js`) |
| Persistence | Browser `localStorage` |
| Deployment | Vercel |

---

## Running Locally

This project uses Vercel Serverless Functions for the API. To run the full stack locally (frontend + API), you need the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **Note:** Using a plain static file server (e.g. `npx serve`) will serve the frontend only — the `/api/blossom` endpoint won't be available and messages won't send.

---

## Environment Variables

Set the following in your Vercel project dashboard or a local `.env` file:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key |

---

## Deploying to Vercel

```bash
vercel --prod
```

Make sure `OPENAI_API_KEY` is set in your Vercel project's Environment Variables before deploying.

---

## Project Structure

```
├── index.html        # App shell — layout, sidebar, hero, input
├── script.js         # All frontend logic (streaming, sessions, voice, shortcuts)
├── style.css         # Design system — CSS variables, glassmorphism, animations
├── api/
│   └── blossom.js    # Serverless function — OpenAI SSE streaming handler
├── blossomIcon.svg   # App icon
└── vercel.json       # Vercel deployment config
```
