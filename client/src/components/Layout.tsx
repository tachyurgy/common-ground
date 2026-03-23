import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  agreementId?: number;
}

export default function Layout({ agreementId }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar agreementId={agreementId} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
