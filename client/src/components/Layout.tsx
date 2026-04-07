import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BackendStatus from './BackendStatus';
import ToastContainer from './Toast';
import type { ToastMessage } from './Toast';

interface LayoutProps {
  agreementId?: number;
  backendReady: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
}

export default function Layout({ agreementId, backendReady, isDark, onToggleTheme, toasts, onDismissToast }: LayoutProps) {
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
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />
      <main className="main-content">
        {!backendReady && <BackendStatus />}
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}
