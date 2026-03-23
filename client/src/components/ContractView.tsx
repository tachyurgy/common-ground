import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AgreementVersion } from '../types';

interface ContractViewProps {
  version: AgreementVersion | null;
  allVersions?: AgreementVersion[];
  onVersionSelect?: (version: AgreementVersion) => void;
}

export default function ContractView({
  version,
  allVersions = [],
  onVersionSelect,
}: ContractViewProps) {
  if (!version) {
    return (
      <div className="contract-empty">
        <p>No contract generated yet. Start by answering the guided questions.</p>
      </div>
    );
  }

  return (
    <div className="contract-view">
      <div className="contract-header">
        <h2>Behavioral Agreement</h2>
        <div className="version-info">
          <span className="version-badge">v{version.version_number}</span>
          <span className="version-date">
            {new Date(version.created_at).toLocaleDateString()}
          </span>
          {version.change_summary && (
            <span className="version-summary">{version.change_summary}</span>
          )}
        </div>
      </div>

      {allVersions.length > 1 && onVersionSelect && (
        <div className="version-selector">
          {allVersions.map((v) => (
            <button
              key={v.id}
              className={`version-tab ${v.id === version.id ? 'active' : ''}`}
              onClick={() => onVersionSelect(v)}
            >
              v{v.version_number}
            </button>
          ))}
        </div>
      )}

      <div className="contract-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {version.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
