import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { ticketsApi } from '../lib/api';
import Spinner from '../components/ui/Spinner';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 120 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 24 }}>{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.list()
      .then((r) => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byStatus = {};
  const byPriority = {};
  const byCategory = {};

  tickets.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    if (t.category) byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  });

  const maxStatus = Math.max(...Object.values(byStatus), 1);
  const maxPriority = Math.max(...Object.values(byPriority), 1);
  const maxCategory = Math.max(...Object.values(byCategory), 1);

  const statusColors = {
    OPEN: '#3b82f6', ASSIGNED: '#8b5cf6', IN_PROGRESS: '#f59e0b',
    WAITING_FOR_CUSTOMER: '#6b7280', RESOLVED: '#10b981', CLOSED: '#374151',
  };
  const priorityColors = {
    LOW: '#10b981', MEDIUM: '#3b82f6', HIGH: '#f59e0b', URGENT: '#ef4444',
  };

  const total = tickets.length;
  const resolved = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average resolution time (resolved_at - created_at) in hours
  const resolvedTickets = tickets.filter((t) => t.resolved_at);
  const avgResolutionHours = resolvedTickets.length > 0
    ? Math.round(
        resolvedTickets.reduce((acc, t) => {
          return acc + (new Date(t.resolved_at) - new Date(t.created_at)) / 3600000;
        }, 0) / resolvedTickets.length
      )
    : null;

  return (
    <div className="animate-in">
      <div className="page-heading">
        <div className="page-heading-left">
          <h1>Analytics</h1>
          <p>Performance insights and ticket trends</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Tickets', value: total, icon: BarChart3, cls: 'stat-icon-blue' },
              { label: 'Resolution Rate', value: `${resRate}%`, icon: CheckCircle2, cls: 'stat-icon-green' },
              {
                label: 'Avg Resolution Time',
                value: avgResolutionHours !== null ? `${avgResolutionHours}h` : '—',
                icon: Clock,
                cls: 'stat-icon-amber',
              },
              { label: 'Urgent Tickets', value: byPriority['URGENT'] || 0, icon: TrendingUp, cls: 'stat-icon-red' },
            ].map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="stat-card animate-in">
                <div className={`stat-icon ${cls}`}><Icon size={20} /></div>
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {/* By Status */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tickets by Status</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(byStatus).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
                ) : (
                  Object.entries(byStatus).map(([status, count]) => (
                    <Bar
                      key={status}
                      label={status.replace(/_/g, ' ')}
                      value={count}
                      max={maxStatus}
                      color={statusColors[status] || '#6366f1'}
                    />
                  ))
                )}
              </div>
            </div>

            {/* By Priority */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tickets by Priority</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(byPriority).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
                ) : (
                  Object.entries(byPriority).map(([priority, count]) => (
                    <Bar
                      key={priority}
                      label={priority}
                      value={count}
                      max={maxPriority}
                      color={priorityColors[priority] || '#6366f1'}
                    />
                  ))
                )}
              </div>
            </div>

            {/* By Category */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tickets by Category</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Object.entries(byCategory).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No category data yet.</p>
                ) : (
                  Object.entries(byCategory).map(([cat, count]) => (
                    <Bar key={cat} label={cat} value={count} max={maxCategory} color="#6366f1" />
                  ))
                )}
              </div>
            </div>

            {/* Unassigned */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Assignment Overview</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Assigned', value: tickets.filter((t) => t.assigned_agent).length, color: '#10b981' },
                  { label: 'Unassigned', value: tickets.filter((t) => !t.assigned_agent).length, color: '#ef4444' },
                ].map(({ label, value, color }) => (
                  <Bar key={label} label={label} value={value} max={total || 1} color={color} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
