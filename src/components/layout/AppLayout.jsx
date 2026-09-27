import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your support activity' },
  '/tickets': { title: 'Tickets', subtitle: 'Manage and track support requests' },
  '/agents': { title: 'Agents', subtitle: 'Manage your support team' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights and performance metrics' },
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const basePath = '/' + pathname.split('/')[1];
  const meta = PAGE_META[basePath] || { title: 'Supportly', subtitle: '' };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            {meta.subtitle && <div className="topbar-subtitle">{meta.subtitle}</div>}
          </div>
          <div className="topbar-actions" />
        </header>

        {/* Page content */}
        <main>
          <div className="page-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
