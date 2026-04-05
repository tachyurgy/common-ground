import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="page landing">
      <div className="landing-hero">
        <h1>Common Ground</h1>
        <p className="tagline">
          Turn difficult conversations into clear, actionable agreements.
        </p>
        <div className="landing-cta">
          <Link to="/new" className="btn btn-primary btn-lg">
            Start a New Agreement
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Learn How It Works
          </Link>
        </div>
      </div>

      <div className="landing-body">
        <div className="landing-how-it-works">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Speak</h3>
                <p>Talk through what's bothering you, what you need, and what you're willing to commit to. Whisper transcribes your words accurately.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Synthesize</h3>
                <p>The system transforms your words into organized sections: commitments, boundaries, communication agreements, and check-in schedules.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Refine</h3>
                <p>Follow-up questions help fill gaps. Amend the contract at any time through another voice session. Every version is preserved.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature">
            <h3>Voice-First</h3>
            <p>
              People say more than they type. Voice input produces more detailed
              and emotionally honest responses, which leads to better contracts.
            </p>
          </div>
          <div className="feature">
            <h3>Concrete, Not Vague</h3>
            <p>
              "I'll text you if I'm going to be more than 15 minutes late"
              instead of "I'll be more considerate." Observable, specific
              commitments.
            </p>
          </div>
          <div className="feature">
            <h3>Living Document</h3>
            <p>
              Agreements evolve. Version history lets you see how the
              relationship has grown. Nothing is lost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
