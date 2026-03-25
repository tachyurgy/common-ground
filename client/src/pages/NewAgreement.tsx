import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgreement } from '../services/api';

export default function NewAgreement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createAgreement({
        title: title.trim(),
        description: description.trim() || undefined,
        participant_names: participantNames.trim() || undefined,
      });

      localStorage.setItem('currentAgreementId', String(result.agreement.id));
      localStorage.setItem(
        `agreement_${result.agreement.id}_prompt`,
        result.initial_prompt
      );

      navigate(`/agreement/${result.agreement.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Start a New Agreement</h1>
      <p>
        Give your agreement a name and optionally describe what you're working
        through. This helps the system generate better initial questions.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="agreement-form">
        <div className="form-group">
          <label htmlFor="title">Agreement Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Household Responsibilities, Communication Boundaries"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="participants">Participants (optional)</label>
          <input
            id="participants"
            type="text"
            value={participantNames}
            onChange={(e) => setParticipantNames(e.target.value)}
            placeholder="e.g., Alex and Jordan"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the situation? What are you trying to resolve?"
            rows={4}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !title.trim()}>
          {loading ? 'Creating...' : 'Begin Agreement Session'}
        </button>
      </form>
    </div>
  );
}
