import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResponses } from '../services/api';
import type { ResponseEntry } from '../types';

export default function Responses() {
  const { id } = useParams<{ id: string }>();
  const agreementId = Number(id);

  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getResponses(agreementId);
        setResponses(result.responses);
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agreementId]);

  if (loading) {
    return (
      <div className="page">
        <div className="spinner" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="page">
        <h1>Responses</h1>
        <p>No responses yet. Start a voice session to begin.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>All Responses</h1>
      <p>{responses.length} response{responses.length !== 1 ? 's' : ''} recorded.</p>

      <div className="responses-list">
        {responses.map((r) => (
          <div key={r.id} className="response-entry">
            <div className="response-meta">
              <span className={`phase-badge phase-${r.phase}`}>{r.phase}</span>
              <span className="response-date">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="response-question">{r.question}</p>
            <blockquote className="response-transcription">
              {r.transcription}
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
