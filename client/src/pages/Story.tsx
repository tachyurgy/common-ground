export default function Story() {
  return (
    <div className="page article">
      <h1>The Story Behind Common Ground</h1>

      <p>
        My sister-in-law is a therapist. She works primarily with couples and
        families, and a recurring frustration in her practice is the gap between
        what happens in a session and what happens at home. People leave feeling
        understood and motivated, then fall back into old patterns because they
        never translated their insights into specific actions.
      </p>

      <p>
        She'd been using paper worksheets for behavioral contracts for years.
        They work, but they're static. Once a couple fills one out, it sits in a
        folder. There's no easy way to revisit it, amend it when circumstances
        change, or see how the agreement has evolved over time.
      </p>

      <p>
        We were talking about this over dinner and I mentioned that the current
        generation of language models are surprisingly good at taking messy,
        emotional human speech and extracting structured meaning from it. Not
        perfect, but good enough that you could use them as a first-pass
        synthesizer, then let people edit and refine.
      </p>

      <p>
        She was skeptical at first. "AI therapy" sounds terrible, and for good
        reason. But that's not what this is. The LLM isn't providing therapy or
        giving advice. It's doing a much simpler job: taking what someone said
        and organizing it into clear categories. Commitments, boundaries,
        communication preferences, logistics. The model generates structure, not
        insight.
      </p>

      <p>
        I built the first prototype in a weekend. Voice recording in the
        browser, Whisper for transcription, Gemini for the synthesis step. It
        was rough but the core loop worked: speak, transcribe, synthesize,
        review, amend. She tested it with a few volunteer clients and the
        feedback was that it felt more natural than writing things out. People
        said more than they would have typed, and the resulting contracts were
        more detailed as a result.
      </p>

      <p>
        Common Ground is the cleaned-up version of that prototype. It's still
        simple by design. No user accounts (each agreement has its own URL),
        no payment processing, no AI-generated advice. Just a structured
        conversation that produces a concrete document two people can point to
        when they need a reminder of what they agreed to.
      </p>
    </div>
  );
}
