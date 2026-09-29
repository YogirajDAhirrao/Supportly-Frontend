import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataCacheProvider } from './context/DataCacheContext';
import { PublicRoute, ProtectedRoute } from './components/layout/RouteGuards';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import NewTicketPage from './pages/NewTicketPage';
import AgentsPage from './pages/AgentsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataCacheProvider>
          <Routes>
          {/* Public routes – redirect to /dashboard if logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Tickets: all roles */}
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />

              {/* New ticket: customers only */}
              <Route
                element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}
              >
                <Route path="/tickets/new" element={<NewTicketPage />} />
              </Route>

              {/* Admin-only routes */}
              <Route
                element={<ProtectedRoute allowedRoles={['SUPPORT_ADMIN']} />}
              >
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataCacheProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
