import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import About from './pages/About';
import Story from './pages/Story';
import Tech from './pages/Tech';
import NewAgreement from './pages/NewAgreement';
import AgreementSession from './pages/AgreementSession';
import ViewContract from './pages/ViewContract';
import VersionHistory from './pages/VersionHistory';
import Responses from './pages/Responses';
import { wakeBackend } from './services/api';
import './App.css';

function AgreementIdTracker({ onId }: { onId: (id: number) => void }) {
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) {
      const numId = Number(id);
      onId(numId);
      localStorage.setItem('currentAgreementId', String(numId));
    }
  }, [id, onId]);
  return null;
}

function AgreementSessionWrapper({ onId }: { onId: (id: number) => void }) {
  return (<><AgreementIdTracker onId={onId} /><AgreementSession /></>);
}

function ViewContractWrapper({ onId }: { onId: (id: number) => void }) {
  return (<><AgreementIdTracker onId={onId} /><ViewContract /></>);
}

function VersionHistoryWrapper({ onId }: { onId: (id: number) => void }) {
  return (<><AgreementIdTracker onId={onId} /><VersionHistory /></>);
}

function ResponsesWrapper({ onId }: { onId: (id: number) => void }) {
  return (<><AgreementIdTracker onId={onId} /><Responses /></>);
}

function App() {
  const [agreementId, setAgreementId] = useState<number | undefined>(() => {
    const stored = localStorage.getItem('currentAgreementId');
    return stored ? Number(stored) : undefined;
  });
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function wake() {
      try {
        await wakeBackend();
        if (!cancelled) setBackendReady(true);
      } catch {
        // retry after 3s
        setTimeout(() => { if (!cancelled) wake(); }, 3000);
      }
    }
    wake();
    return () => { cancelled = true; };
  }, []);

  const handleAgreementId = useCallback((id: number) => {
    setAgreementId(id);
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout agreementId={agreementId} backendReady={backendReady} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/story" element={<Story />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/new" element={<NewAgreement />} />
          <Route path="/agreement/:id" element={<AgreementSessionWrapper onId={handleAgreementId} />} />
          <Route path="/agreement/:id/contract" element={<ViewContractWrapper onId={handleAgreementId} />} />
          <Route path="/agreement/:id/history" element={<VersionHistoryWrapper onId={handleAgreementId} />} />
          <Route path="/agreement/:id/responses" element={<ResponsesWrapper onId={handleAgreementId} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
