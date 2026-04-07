import { useEffect, useState, useCallback, createContext, useContext } from 'react';
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
import { useToast } from './hooks/useToast';
import './App.css';

interface ToastContextType {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
  info: () => {},
});

export function useToastContext() {
  return useContext(ToastContext);
}

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

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}

function App() {
  const [agreementId, setAgreementId] = useState<number | undefined>(() => {
    const stored = localStorage.getItem('currentAgreementId');
    return stored ? Number(stored) : undefined;
  });
  const [backendReady, setBackendReady] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();
  const { toasts, dismissToast, success, error, info } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function wake() {
      try {
        await wakeBackend();
        if (!cancelled) {
          setBackendReady(true);
          info('Connected to server');
        }
      } catch {
        setTimeout(() => { if (!cancelled) wake(); }, 3000);
      }
    }
    wake();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgreementId = useCallback((id: number) => {
    setAgreementId(id);
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={
            <Layout
              agreementId={agreementId}
              backendReady={backendReady}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              toasts={toasts}
              onDismissToast={dismissToast}
            />
          }>
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
    </ToastContext.Provider>
  );
}

export default App;
