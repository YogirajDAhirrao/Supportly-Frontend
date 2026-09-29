import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, CheckCircle2, AlertCircle,
  TrendingUp, ArrowRight, Clock, Plus,
  Activity, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataCache } from '../context/DataCacheContext';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { formatRelativeTime, ROLES } from '../lib/utils';
import Spinner from '../components/ui/Spinner';

function StatCard({ icon: Icon, label, value, iconClass, trend }) {
  return (
    <div className="stat-card animate-in">
      <div className={`stat-icon ${iconClass}`}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend != null && (
        <div style={{
          alignSelf: 'flex-start',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: trend >= 0 ? '#34d399' : '#f87171',
          background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          padding: '0.2rem 0.45rem',
          borderRadius: 99,
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tickets: ticketCache } = useDataCache();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketCache.list()
      .then(({ data }) => setTickets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticketCache]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length,
    resolved: tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
    urgent: tickets.filter((t) => t.priority === 'URGENT').length,
  };

  const recent = tickets.slice(0, 5);
  const firstName = user?.first_name || user?.username || 'there';

  return (
    <div className="animate-in">
      {/* Greeting */}
      <div className="page-heading">
        <div className="page-heading-left">
          <h1>
            {getGreeting()}, <span style={{ background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{firstName}</span> 👋
          </h1>
          <p>Here&apos;s what&apos;s happening with your support tickets today.</p>
        </div>
        {user?.role === ROLES.CUSTOMER && (
          <Link to="/tickets/new" className="btn btn-primary">
            <Plus size={15} />
            New Ticket
          </Link>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-4 stagger" style={{ marginBottom: '2rem' }}>
            <StatCard icon={Ticket}       label="Total Tickets"    value={stats.total}      iconClass="stat-icon-blue"   />
            <StatCard icon={Zap}          label="Open"             value={stats.open}       iconClass="stat-icon-purple" />
            <StatCard icon={TrendingUp}   label="In Progress"      value={stats.inProgress} iconClass="stat-icon-amber"  />
            <StatCard icon={CheckCircle2} label="Resolved / Closed" value={stats.resolved}  iconClass="stat-icon-green"  />
          </div>

          {stats.urgent > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>{stats.urgent} urgent ticket{stats.urgent > 1 ? 's' : ''}</strong> need{stats.urgent === 1 ? 's' : ''} immediate attention.
              </span>
            </div>
          )}

          {/* Recent Tickets */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Activity size={16} style={{ color: 'var(--accent-light)' }} />
                Recent Tickets
              </span>
              <Link to="/tickets" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Ticket size={24} /></div>
                <div className="empty-title">No tickets yet</div>
                <div className="empty-subtitle">
                  {user?.role === ROLES.CUSTOMER
                    ? 'Submit your first support ticket to get started.'
                    : 'No tickets have been assigned to you yet.'}
                </div>
                {user?.role === ROLES.CUSTOMER && (
                  <Link to="/tickets/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                    <Plus size={14} /> Create Ticket
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id}>
                        <td><span className="ticket-number">{t.ticket_number}</span></td>
                        <td className="td-primary" style={{ maxWidth: 260 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {t.subject}
                          </span>
                        </td>
                        <td><StatusBadge status={t.status} /></td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            <Clock size={11} />
                            {formatRelativeTime(t.updated_at)}
                          </span>
                        </td>
                        <td>
                          <Link to={`/tickets/${t.id}`} className="btn btn-ghost btn-sm">
                            View <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
