import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContractView from '../components/ContractView';
import { getAgreement, getVersions, requestAmendment } from '../services/api';
import type { Agreement, AgreementVersion } from '../types';

export default function ViewContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agreementId = Number(id);

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [versions, setVersions] = useState<AgreementVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<AgreementVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [amendLoading, setAmendLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [agResult, verResult] = await Promise.all([
          getAgreement(agreementId),
          getVersions(agreementId),
        ]);
        setAgreement(agResult.agreement);
        setVersions(verResult.versions);
        setSelectedVersion(
          agResult.agreement.current_version || verResult.versions[verResult.versions.length - 1] || null
        );
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agreementId]);

  const handleAmend = async () => {
    setAmendLoading(true);
    try {
      const result = await requestAmendment(agreementId);
      localStorage.setItem(`agreement_${agreementId}_prompt`, result.prompt);
      navigate(`/agreement/${agreementId}`);
    } catch {
      // fall back to session page
      navigate(`/agreement/${agreementId}`);
    } finally {
      setAmendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner" />
        <p>Loading contract...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="contract-page-header">
        <h1>{agreement?.title || 'Contract'}</h1>
        {agreement?.current_version && (
          <button
            className="btn btn-secondary"
            onClick={handleAmend}
            disabled={amendLoading}
          >
            {amendLoading ? 'Preparing...' : 'Amend Agreement'}
          </button>
        )}
      </div>

      <ContractView
        version={selectedVersion}
        allVersions={versions}
        onVersionSelect={setSelectedVersion}
      />
    </div>
  );
}
