import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="page landing">
      <div className="landing-hero">
        <h1>Common Ground</h1>
        <p className="tagline">
          Turn difficult conversations into clear, actionable agreements.
        </p>
      </div>

      <div className="landing-body">
        <p>
          Common Ground is a voice-first tool that helps two people work through
          conflict and land on something concrete. You talk through what's
          bothering you, what you need, and what you're willing to commit to. The
          system listens, transcribes, and synthesizes your responses into a
          mutual behavioral contract.
        </p>

        <p>
          Not a vague promise to "do better." Specific, observable commitments
          that both parties agree to, with built-in check-ins and a clear process
          for when things go sideways.
        </p>

        <div className="landing-cta">
          <Link to="/new" className="btn btn-primary btn-lg">
            Start a New Agreement
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Learn How It Works
          </Link>
        </div>

        <div className="landing-features">
          <div className="feature">
            <h3>Voice-First</h3>
            <p>
              Speak naturally. The system uses Whisper to transcribe your words
              accurately, so you can focus on saying what you mean instead of
              typing it out.
            </p>
          </div>
          <div className="feature">
            <h3>Structured Output</h3>
            <p>
              Raw conversation gets transformed into organized sections:
              commitments, boundaries, communication agreements, and a
              check-in schedule.
            </p>
          </div>
          <div className="feature">
            <h3>Living Document</h3>
            <p>
              Agreements evolve. Amend your contract at any time through another
              voice session. Every version is preserved so you can see how the
              relationship has grown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
