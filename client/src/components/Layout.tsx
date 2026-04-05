import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BackendStatus from './BackendStatus';

interface LayoutProps {
  agreementId?: number;
  backendReady: boolean;
}

export default function Layout({ agreementId, backendReady }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <span /><span /><span />
      </button>
      <Sidebar
        agreementId={agreementId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        {!backendReady && <BackendStatus />}
        <Outlet />
      </main>
    </div>
  );
}
