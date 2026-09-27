import { useEffect, useState } from 'react';
import { Users, Ticket, BarChart2 } from 'lucide-react';
import { ticketsApi } from '../lib/api';
import { StatusBadge } from '../components/ui/Badges';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

export default function AgentsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.list()
      .then((r) => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
        </div>
      ) : agents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Users size={26} /></div>
            <div className="empty-title">No agents yet</div>
            <div className="empty-subtitle">
              Agents will appear here once tickets have been assigned to them.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Agent cards */}
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {agents.map((agent) => (
              <div key={agent.name} className="card animate-in">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <Avatar name={agent.name} size="lg" />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Support Agent</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Total', value: agent.total, color: 'var(--accent-light)' },
                      { label: 'Active', value: agent.open + agent.inProgress, color: '#fbbf24' },
                      { label: 'Resolved', value: agent.resolved, color: '#34d399' },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{
                          flex: '1 1 60px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius)',
                          padding: '0.75rem',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>
                          {value}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agent table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <BarChart2 size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
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
                        <td style={{ color: '#34d399' }}>{a.resolved}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              flex: 1, height: 5,
                              background: 'var(--bg-elevated)',
                              borderRadius: 99,
                              overflow: 'hidden',
                              minWidth: 80,
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${rate}%`,
                                background: rate > 66 ? '#10b981' : rate > 33 ? '#f59e0b' : '#ef4444',
                                borderRadius: 99,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 34 }}>
                              {rate}%
                            </span>
                          </div>
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
