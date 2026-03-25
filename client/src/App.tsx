import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  const [agreementId, setAgreementId] = useState<number | undefined>(() => {
    const stored = localStorage.getItem('currentAgreementId');
    return stored ? Number(stored) : undefined;
  });

  useEffect(() => {
    wakeBackend();
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('currentAgreementId');
      setAgreementId(stored ? Number(stored) : undefined);
    };
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(() => {
      const stored = localStorage.getItem('currentAgreementId');
      const current = stored ? Number(stored) : undefined;
      if (current !== agreementId) setAgreementId(current);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [agreementId]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout agreementId={agreementId} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/story" element={<Story />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/new" element={<NewAgreement />} />
          <Route path="/agreement/:id" element={<AgreementSession />} />
          <Route path="/agreement/:id/contract" element={<ViewContract />} />
          <Route path="/agreement/:id/history" element={<VersionHistory />} />
          <Route path="/agreement/:id/responses" element={<Responses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
