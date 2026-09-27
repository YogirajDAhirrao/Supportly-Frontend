import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, Plus, ArrowRight, Clock, Filter } from 'lucide-react';
import { ticketsApi } from '../lib/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { formatRelativeTime, ROLES } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    ticketsApi.list()
      .then((r) => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !statusFilter || t.status === statusFilter;
      const matchPriority = !priorityFilter || t.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  return (
    <div className="animate-in">
      <div className="page-heading">
        <div className="page-heading-left">
          <h1>
            {user?.role === ROLES.CUSTOMER
              ? 'My Tickets'
              : user?.role === ROLES.SUPPORT_AGENT
              ? 'Assigned Tickets'
              : 'All Tickets'}
          </h1>
          <p>
            {loading ? 'Loading…' : `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {user?.role === ROLES.CUSTOMER && (
          <Link to="/tickets/new" className="btn btn-primary" id="create-ticket-btn">
            <Plus size={15} />
            New Ticket
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filters-row" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            id="ticket-search"
            type="search"
            placeholder="Search tickets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="status-filter"
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_CUSTOMER">Waiting</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          id="priority-filter"
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        {(search || statusFilter || priorityFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
          >
            <Filter size={13} /> Clear
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Ticket size={26} /></div>
            <div className="empty-title">
              {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
            </div>
            <div className="empty-subtitle">
              {tickets.length === 0 && user?.role === ROLES.CUSTOMER
                ? 'Create your first support ticket to get started.'
                : 'Try adjusting your search or filter criteria.'}
            </div>
            {tickets.length === 0 && user?.role === ROLES.CUSTOMER && (
              <Link to="/tickets/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                Create Ticket
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
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  {user?.role !== ROLES.CUSTOMER && <th>Customer</th>}
                  {user?.role === ROLES.SUPPORT_ADMIN && <th>Agent</th>}
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="ticket-number">{t.ticket_number}</span>
                    </td>
                    <td className="td-primary" style={{ maxWidth: 220 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {t.subject}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.category || '—'}</span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    {user?.role !== ROLES.CUSTOMER && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Avatar name={t.customer || ''} size="sm" />
                          <span style={{ fontSize: '0.82rem' }}>{t.customer || '—'}</span>
                        </div>
                      </td>
                    )}
                    {user?.role === ROLES.SUPPORT_ADMIN && (
                      <td>
                        {t.assigned_agent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Avatar name={t.assigned_agent} size="sm" />
                            <span style={{ fontSize: '0.82rem' }}>{t.assigned_agent}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                    )}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Clock size={12} />
                        {formatRelativeTime(t.updated_at)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/tickets/${t.id}`} className="btn btn-ghost btn-sm" id={`view-ticket-${t.id}`}>
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
    </div>
  );
}
