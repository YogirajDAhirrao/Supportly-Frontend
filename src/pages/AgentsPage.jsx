import { useEffect, useState } from 'react';
import { Users, BarChart2 } from 'lucide-react';
import { useDataCache } from '../context/DataCacheContext';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

function ResolutionBar({ rate }) {
  const color = rate > 66 ? '#10b981' : rate > 33 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="progress-bar-track" style={{ minWidth: 80 }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${rate}%`, background: color }}
        />
      </div>
      <span style={{ fontSize: '0.78rem', color, fontWeight: 600, minWidth: 36 }}>
        {rate}%
      </span>
    </div>
  );
}

export default function AgentsPage() {
  const { tickets: ticketCache } = useDataCache();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketCache.list()
      .then(({ data }) => setTickets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticketCache]);

  // Derive agent stats from tickets
  const agentMap = {};
  tickets.forEach((t) => {
    if (!t.assigned_agent) return;
    if (!agentMap[t.assigned_agent]) {
      agentMap[t.assigned_agent] = {
        name: t.assigned_agent,
        total: 0, open: 0, resolved: 0, inProgress: 0,
      };
    }
    const a = agentMap[t.assigned_agent];
    a.total++;
    if (['OPEN', 'ASSIGNED'].includes(t.status)) a.open++;
    if (t.status === 'IN_PROGRESS') a.inProgress++;
    if (['RESOLVED', 'CLOSED'].includes(t.status)) a.resolved++;
  });

  const agents = Object.values(agentMap);

  return (
    <div className="animate-in">
      <div className="page-heading">
        <div className="page-heading-left">
          <h1>Agents</h1>
          <p>Support team performance overview</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Spinner size="lg" />
        </div>
      ) : agents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Users size={24} /></div>
            <div className="empty-title">No agents yet</div>
            <div className="empty-subtitle">
              Agents will appear here once tickets have been assigned to them.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Agent cards */}
          <div className="grid-3 stagger" style={{ marginBottom: '2rem' }}>
            {agents.map((agent) => {
              const rate = agent.total > 0 ? Math.round((agent.resolved / agent.total) * 100) : 0;
              return (
                <div key={agent.name} className="card">
                  <div className="card-body">
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <Avatar name={agent.name} size="lg" />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
                          {agent.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Support Agent
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Total', value: agent.total, color: 'var(--accent-light)' },
                        { label: 'Active', value: agent.open + agent.inProgress, color: '#fbbf24' },
                        { label: 'Done', value: agent.resolved, color: '#34d399' },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          style={{
                            flex: '1 1 0',
                            background: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius)',
                            padding: '0.65rem',
                            textAlign: 'center',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {value}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resolution bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Resolution rate</span>
                      </div>
                      <ResolutionBar rate={rate} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <BarChart2 size={16} style={{ color: 'var(--accent-light)' }} />
                Agent Workload
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Total</th>
                    <th>Open / Assigned</th>
                    <th>In Progress</th>
                    <th>Resolved / Closed</th>
                    <th>Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a) => {
                    const rate = a.total > 0 ? Math.round((a.resolved / a.total) * 100) : 0;
                    return (
                      <tr key={a.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Avatar name={a.name} size="sm" />
                            <span className="td-primary">{a.name}</span>
                          </div>
                        </td>
                        <td className="td-primary">{a.total}</td>
                        <td>{a.open}</td>
                        <td>{a.inProgress}</td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>{a.resolved}</td>
                        <td>
                          <ResolutionBar rate={rate} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
