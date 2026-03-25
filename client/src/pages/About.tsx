export default function About() {
  return (
    <div className="page article">
      <h1>What Is This?</h1>

      <p>
        Common Ground is a lightweight tool that helps two people turn difficult
        conversations into clear, actionable agreements. It was originally
        developed in collaboration with a practicing therapist who works with
        couples and families navigating chronic conflict.
      </p>

      <p>
        The core problem it solves is familiar to anyone who's been in a
        relationship that hit a rough patch. Two people sit down and say they'll
        "work on it." They mean it. But "work on it" is vague enough that a week
        later, they're back where they started, arguing about whether anyone
        actually changed anything.
      </p>

      <p>
        What therapists have known for decades is that behavioral contracts work.
        Not the corporate-sounding kind, but simple agreements where each person
        says exactly what they'll do differently, in specific and observable
        terms. "I'll text you if I'm going to be more than 15 minutes late"
        instead of "I'll be more considerate." "We'll check in every Sunday for
        20 minutes" instead of "We should communicate more."
      </p>

      <p>
        The challenge is getting from the raw emotion of a difficult conversation
        to that level of specificity. That's where language models help. The
        system walks each participant through a series of guided questions, then
        synthesizes their responses into a mutual behavioral contract. It focuses
        on translating abstract needs into observable behaviors, reducing
        ambiguity, and creating mutual accountability.
      </p>

      <h2>How It Works</h2>

      <p>
        You start a new agreement session and give it a name. The system
        generates a conversational prompt, and you respond by speaking into your
        microphone. Your audio is recorded, uploaded, and transcribed using
        OpenAI's Whisper model (via Groq for fast inference). The transcription
        becomes the raw material for your contract.
      </p>

      <p>
        After your initial responses, the system generates follow-up questions
        that dig into areas where your commitments could be more specific, or
        topics that were mentioned but not fully explored. You can answer these
        or skip them. Each answer refines and extends the behavioral contract.
      </p>

      <p>
        At any point, you can amend the contract. This starts a new voice
        session focused on what you want to change. The system generates an
        updated version of the contract while preserving the previous version, so
        you have a complete history of how your agreement has evolved.
      </p>

      <h2>Who Is It For?</h2>

      <p>
        Any relationship where two people need to get on the same page about
        specific behaviors. Couples working through communication issues.
        Roommates who keep having the same argument about dishes. Co-parents
        trying to coordinate logistics. Business partners who need clearer
        boundaries. The tool doesn't replace therapy, but it gives people a
        structured way to have the conversations that therapy often encourages.
      </p>
    </div>
  );
}
