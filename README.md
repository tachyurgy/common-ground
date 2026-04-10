# Common Ground

**Live frontend demo:** https://common-ground-vqyr.onrender.com (React client only — the Rails API is not deployed on free tier because the workspace is already using its single free Postgres for the Pulse deploy. Voice recording, transcription, and contract generation require the backend to be running locally.)

A voice-driven behavioral agreement builder that helps two people turn difficult conversations into clear, actionable contracts.

Originally developed in collaboration with a practicing therapist, Common Ground explores how structured prompting and low-cost language models can guide users from vague concerns ("this isn't working") to concrete, shared expectations with built-in accountability.

## How It Works

1. **Start a session.** Name your agreement and describe the situation.
2. **Speak.** The system generates a conversational prompt and you respond by talking into your microphone. Audio is recorded, uploaded to S3, and transcribed using Whisper Large v3 Turbo via Groq.
3. **Review.** Your transcription feeds into Gemini Flash, which synthesizes a structured behavioral contract: specific commitments, boundaries, communication agreements, check-in schedules, and a conflict resolution process.
4. **Refine.** The system suggests follow-up topics to strengthen the agreement. Answer any that feel relevant, skip the rest. Each answer extends the contract.
5. **Amend.** Agreements are living documents. Start a new voice session at any time to modify the contract. Every version is preserved.

## Architecture

```
client/          React/TypeScript SPA (Vite, GitHub Pages)
api/             Rails 8 API (PostgreSQL, Sidekiq, Render)
```

### Backend

- **Rails 8** API-only mode with PostgreSQL
- **Sidekiq** + Redis for async transcription and LLM processing
- **Groq** Whisper Large v3 Turbo for speech-to-text (fast inference on custom hardware)
- **Gemini Flash** for contract synthesis and follow-up generation
- **AWS S3** for audio storage with presigned URLs

### Frontend

- **React 19** with TypeScript
- **Vite** for builds and dev server
- **react-markdown** with GFM support for contract rendering
- **MediaRecorder API** for in-browser audio capture
- Documentation-style sidebar navigation (honkit pattern)

### Data Model

Agreements have versioned contracts, responses (voice transcriptions), follow-up questions, and audio recordings. Each amendment creates a new contract version while preserving all previous versions.

## Development

### Prerequisites

- Ruby 3.3+, Rails 8+
- Node 20+
- PostgreSQL 14+
- Redis

### Backend

```bash
cd api
bundle install
rails db:create db:migrate
```

Create `api/.env.development` with:

```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
CORS_ORIGINS=http://localhost:5173
REDIS_URL=redis://localhost:6379/0
```

```bash
rails server                # API on port 3000
bundle exec sidekiq         # Background jobs
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env` with:

```
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev                 # Dev server on port 5173
```

## Testing

### Backend (146 tests, 100% line coverage)

```bash
cd api && bundle exec rspec
```

Covers models, request specs for all API endpoints, service specs (Groq, Gemini, S3 with stubbed HTTP), and job specs.

### Frontend (98 tests)

```bash
cd client && npm test
```

Covers all components, pages, hooks, and the API service layer using Vitest and React Testing Library.

## Deployment

### Backend (Render)

Deploy with the included `render.yaml` blueprint. Set environment variables for API keys, S3 credentials, and CORS origins.

The free tier spins down after inactivity. The frontend sends a health check request on page load so the backend wakes up before the user needs it.

### Frontend (GitHub Pages)

```bash
cd client
npm run build
# Deploy dist/ to gh-pages branch
```

Includes SPA routing support via 404.html redirect.

## Design Decisions

**Why Groq for transcription?** Latency. Groq's custom LPU hardware returns Whisper transcriptions significantly faster than other hosted options. For a conversational tool where you're waiting for your words to appear on screen, that responsiveness matters.

**Why Gemini Flash over a larger model?** The LLM's job here is structured synthesis, not creative reasoning. It takes messy human speech and organizes it into clear categories. Gemini Flash handles this well at a fraction of the cost, which matters when processing dozens of voice responses per session.

**Why no user accounts?** Simplicity. Each agreement has its own URL. This is a tool for two people working through a specific issue, not a platform with social features. Adding auth would be straightforward (Devise or JWT) but doesn't serve the core use case.

**Why voice-first?** People say more than they type. In testing with volunteer therapy clients, voice responses produced more detailed and emotionally honest input, which led to better contracts. The transcription step also creates a natural moment for reflection when you see your words on screen.

## License

MIT
