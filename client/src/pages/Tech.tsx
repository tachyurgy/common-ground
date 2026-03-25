export default function Tech() {
  return (
    <div className="page article">
      <h1>Tech Stack</h1>

      <p>
        Common Ground is a full-stack application with a Rails API backend and a
        React/TypeScript frontend. The architecture prioritizes simplicity where
        possible and reaches for more sophisticated tooling only where the
        problem demands it.
      </p>

      <h2>Backend: Rails 8 API</h2>

      <p>
        The API is a standard Rails 8 application running in API-only mode.
        PostgreSQL handles persistence, and Sidekiq processes background jobs
        (transcription and LLM calls can take several seconds, so they happen
        asynchronously). The data model is straightforward: agreements have
        versioned contracts, responses, follow-up questions, and audio
        recordings.
      </p>

      <p>
        The backend is deployed on Render's free tier. Because free-tier
        instances spin down after inactivity, the frontend sends a health check
        request as soon as the page loads, so the backend is already waking up
        before the user needs it.
      </p>

      <h2>Voice Input: Whisper via Groq</h2>

      <p>
        Audio recording happens in the browser using the MediaRecorder API. The
        recorded audio (WebM/Opus) gets uploaded to S3, then a Sidekiq job sends
        it to Groq's hosted Whisper Large v3 Turbo model for transcription.
        Groq's inference is fast enough that most recordings come back
        transcribed within a few seconds.
      </p>

      <p>
        I chose Groq over running Whisper locally or using OpenAI's API because
        of the latency profile. Groq's custom hardware returns transcriptions
        significantly faster than other hosted options, and for a conversational
        tool where you're waiting for your words to appear on screen, that
        responsiveness matters.
      </p>

      <h2>LLM: Gemini Flash</h2>

      <p>
        Contract generation and follow-up question synthesis use Google's Gemini
        Flash model. The choice was deliberate: this application doesn't need
        frontier-model reasoning. The LLM's job is structured synthesis, not
        creative problem-solving. Gemini Flash handles this well at a fraction of
        the cost of larger models, which matters for a tool that might process
        dozens of voice responses per agreement session.
      </p>

      <p>
        The prompts are designed to produce specific, behavioral language rather
        than therapeutic advice. The model generates the contract structure and
        suggests follow-up topics, but it never interprets emotions or provides
        counseling. That constraint is intentional and reflected in the system
        prompts.
      </p>

      <h2>Storage: S3</h2>

      <p>
        Audio recordings live in S3. Each agreement gets its own prefix in the
        bucket, and recordings are accessible via presigned URLs that expire
        after an hour. The backend handles upload via presigned URLs (so the
        client uploads directly to S3 without the audio passing through the API
        server) or via direct upload to the API for simpler client
        implementations.
      </p>

      <h2>Frontend: React + TypeScript</h2>

      <p>
        The frontend is a single-page React application built with Vite and
        deployed to GitHub Pages. It uses React Router for navigation and
        react-markdown for rendering the contract documents. The UI is
        intentionally minimal: the focus is on the voice interaction and the
        resulting contract, not on visual complexity.
      </p>

      <p>
        The sidebar navigation follows a documentation-site pattern (similar to
        GitBook or HonKit) because the primary output is a series of text
        documents that users need to navigate between. Markdown rendering with
        GFM support means contracts can include tables, checklists, and other
        structured content.
      </p>

      <h2>Background Processing: Sidekiq</h2>

      <p>
        Transcription and contract generation happen asynchronously via Sidekiq.
        When a user submits a voice recording, they get immediate feedback that
        the upload succeeded, and the transcription/generation pipeline runs in
        the background. The frontend polls for status updates until the results
        are ready.
      </p>

      <h2>Testing</h2>

      <p>
        Backend tests use RSpec with factory_bot for test data. External API
        calls (Groq, Gemini, S3) are stubbed with WebMock in unit tests.
        Frontend tests use Vitest and React Testing Library. End-to-end tests
        use Playwright, covering the full voice recording and contract generation
        flow with mocked audio input.
      </p>
    </div>
  );
}
