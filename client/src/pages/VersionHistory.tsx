import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getVersions } from '../services/api';
import type { AgreementVersion } from '../types';

export default function VersionHistory() {
  const { id } = useParams<{ id: string }>();
  const agreementId = Number(id);

  const [versions, setVersions] = useState<AgreementVersion[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getVersions(agreementId);
        setVersions(result.versions);
        if (result.versions.length > 0) {
          setExpandedId(result.versions[result.versions.length - 1].id);
        }
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

  if (versions.length === 0) {
    return (
      <div className="page">
        <h1>Version History</h1>
        <p>No contract versions yet. Complete a voice session to generate your first contract.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Version History</h1>
      <p>{versions.length} version{versions.length !== 1 ? 's' : ''} of this agreement.</p>

      <div className="version-timeline">
        {[...versions].reverse().map((v) => (
          <div key={v.id} className="version-entry">
            <div
              className="version-entry-header"
              onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
            >
              <span className="version-badge">v{v.version_number}</span>
              <span className="version-date">
                {new Date(v.created_at).toLocaleDateString()} at{' '}
                {new Date(v.created_at).toLocaleTimeString()}
              </span>
              {v.change_summary && <span className="version-summary">{v.change_summary}</span>}
              <span className="expand-icon">{expandedId === v.id ? '−' : '+'}</span>
            </div>
            {expandedId === v.id && (
              <div className="version-entry-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
