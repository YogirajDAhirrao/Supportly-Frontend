import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, UserCheck, RefreshCw,
  MessageSquare, Activity, Info,
} from 'lucide-react';
import { ticketsApi } from '../lib/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { formatDate, formatRelativeTime, ROLES, ALLOWED_TRANSITIONS } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // messages | activity

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Assign form
  const [agentId, setAgentId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status form
  const [newStatus, setNewStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const threadRef = useRef(null);

  // Load ticket + messages
  useEffect(() => {
    Promise.all([
      ticketsApi.get(id),
      ticketsApi.getMessages(id),
    ])
      .then(([tRes, mRes]) => {
        setTicket(tRes.data);
        setMessages(mRes.data);
      })
      .catch(() => navigate('/tickets'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setSendingMsg(true);
    try {
      const res = await ticketsApi.sendMessage(id, { content: msgContent.trim() });
      setMessages((m) => [...m, res.data]);
      setMsgContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError('');
    if (!agentId.trim()) { setAssignError('Please enter an agent ID.'); return; }
    setAssigning(true);
    try {
      const res = await ticketsApi.assign(id, { agent_id: parseInt(agentId, 10) });
      setTicket(res.data);
      setShowAssignModal(false);
      setAgentId('');
    } catch (err) {
      const data = err.response?.data;
      setAssignError(data?.agent_id?.[0] || data?.detail || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusError('');
    if (!newStatus) { setStatusError('Please select a status.'); return; }
    setUpdatingStatus(true);
    try {
      const res = await ticketsApi.updateStatus(id, { status: newStatus });
      setTicket(res.data);
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      const data = err.response?.data;
      setStatusError(data?.detail || 'Status update failed.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const allowedNextStatuses = ticket ? ALLOWED_TRANSITIONS[ticket.status] || [] : [];
  const canUpdateStatus =
    ticket &&
    allowedNextStatuses.length > 0 &&
    (user?.role === ROLES.SUPPORT_ADMIN ||
      (user?.role === ROLES.SUPPORT_AGENT && ticket.assigned_agent));

  const isTicketClosed = ticket?.status === 'CLOSED';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) return null;

  const senderName = (msg) => {
    if (msg.sender_name) return msg.sender_name;
    return msg.sender?.toString() || 'Unknown';
  };

  const isOwn = (msg) => msg.sender === user?.id;

  return (
    <div className="animate-in">
      {/* Page header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
              <span className="ticket-number">{ticket.ticket_number}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 style={{ fontSize: '1.3rem', marginTop: '0.1rem' }}>{ticket.subject}</h1>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {user?.role === ROLES.SUPPORT_ADMIN && (
            <button
              id="assign-ticket-btn"
              className="btn btn-secondary"
              onClick={() => setShowAssignModal(true)}
            >
              <UserCheck size={15} /> Assign Agent
            </button>
          )}
          {canUpdateStatus && (
            <button
              id="update-status-btn"
              className="btn btn-primary"
              onClick={() => setShowStatusModal(true)}
            >
              <RefreshCw size={15} /> Update Status
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="ticket-detail-grid">
        {/* Left: Messages + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Info size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Description
              </span>
            </div>
            <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {ticket.description}
            </div>
          </div>

          {/* Tabs */}
          <div className="card" style={{ overflow: 'visible' }}>
            {/* Tab headers */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {[
                { key: 'messages', label: 'Messages', icon: MessageSquare },
                { key: 'activity', label: 'Activity', icon: Activity },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  id={`tab-${key}`}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activeTab === key ? 'var(--accent-light)' : 'var(--text-secondary)',
                    borderBottom: `2px solid ${activeTab === key ? 'var(--accent)' : 'transparent'}`,
                    marginBottom: '-1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'color 0.15s',
                  }}
                >
                  <Icon size={14} />
                  {label}
                  {key === 'messages' && messages.length > 0 && (
                    <span style={{
                      background: 'var(--accent-glow)',
                      color: 'var(--accent-light)',
                      padding: '0 0.45rem',
                      borderRadius: 99,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}>
                      {messages.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'messages' && (
              <>
                {/* Message thread */}
                <div className="message-thread" ref={threadRef}>
                  {messages.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2.5rem' }}>
                      <div className="empty-icon"><MessageSquare size={22} /></div>
                      <div className="empty-title">No messages yet</div>
                      <div className="empty-subtitle">Start the conversation by sending a message below.</div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const own = isOwn(msg);
                      const name = senderName(msg);
                      return (
                        <div key={msg.id} className={`message-bubble ${own ? 'own' : ''}`}>
                          <Avatar name={name} size="sm" />
                          <div>
                            <div className="bubble-content">
                              {!own && <div className="bubble-sender">{name}</div>}
                              <div className="bubble-text">{msg.content}</div>
                            </div>
                            <div className="bubble-time" style={{ textAlign: own ? 'right' : 'left' }}>
                              {formatRelativeTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message input */}
                {!isTicketClosed ? (
                  <form className="message-input-row" onSubmit={handleSendMessage} id="message-form">
                    <textarea
                      id="message-input"
                      placeholder="Type your message…"
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      disabled={sendingMsg}
                      style={{ minHeight: 60, maxHeight: 140 }}
                    />
                    <button
                      id="send-message-btn"
                      type="submit"
                      className="btn btn-primary btn-icon"
                      disabled={sendingMsg || !msgContent.trim()}
                      aria-label="Send message"
                    >
                      {sendingMsg ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Send size={15} />}
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                    <div className="alert alert-info">
                      This ticket is closed. No further messages can be sent.
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <ActivityTab ticketId={id} />
            )}
          </div>
        </div>

        {/* Right: Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="ticket-meta-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ticket Info
              </span>
            </div>

            {[
              { key: 'Status', val: <StatusBadge status={ticket.status} /> },
              { key: 'Priority', val: <PriorityBadge priority={ticket.priority} /> },
              { key: 'Category', val: ticket.category || '—' },
              { key: 'Customer', val: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar name={ticket.customer || ''} size="sm" />
                  <span>{ticket.customer || '—'}</span>
                </div>
              )},
              { key: 'Agent', val: ticket.assigned_agent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar name={ticket.assigned_agent} size="sm" />
                  <span>{ticket.assigned_agent}</span>
                </div>
              ) : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span> },
              { key: 'Created', val: formatDate(ticket.created_at) },
              { key: 'Updated', val: formatDate(ticket.updated_at) },
              { key: 'Resolved', val: ticket.resolved_at ? formatDate(ticket.resolved_at) : '—' },
              { key: 'Closed', val: ticket.closed_at ? formatDate(ticket.closed_at) : '—' },
            ].map(({ key, val }) => (
              <div className="ticket-meta-row" key={key}>
                <span className="ticket-meta-key">{key}</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <Modal title="Assign Agent" onClose={() => { setShowAssignModal(false); setAssignError(''); setAgentId(''); }}>
          <form onSubmit={handleAssign} id="assign-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="agent-id-input">Agent User ID</label>
              <input
                id="agent-id-input"
                type="number"
                placeholder="Enter the agent's user ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                style={assignError ? { borderColor: '#ef4444' } : {}}
                required
              />
              {assignError && <span className="form-error">{assignError}</span>}
              <span className="form-hint">The agent must have the SUPPORT_AGENT role and be active.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="confirm-assign-btn" type="submit" className="btn btn-primary" disabled={assigning}>
                {assigning ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Assigning…</> : <><UserCheck size={15} /> Assign</>}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <Modal title="Update Status" onClose={() => { setShowStatusModal(false); setStatusError(''); setNewStatus(''); }}>
          <form onSubmit={handleStatusUpdate} id="status-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-status-select">New Status</label>
              <select
                id="new-status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={statusError ? { borderColor: '#ef4444' } : {}}
              >
                <option value="">Select new status…</option>
                {allowedNextStatuses.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {statusError && <span className="form-error">{statusError}</span>}
              <span className="form-hint">
                Current: <strong>{ticket.status.replace(/_/g, ' ')}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="confirm-status-btn" type="submit" className="btn btn-primary" disabled={updatingStatus}>
                {updatingStatus ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Updating…</> : <><RefreshCw size={15} /> Update</>}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Activity tab loads lazily
function ActivityTab({ ticketId }) {
  // We don't have a dedicated activity endpoint exposed in the API
  // so we show a meaningful placeholder
  return (
    <div style={{ padding: '1.5rem' }}>
      <div className="empty-state" style={{ padding: '2rem' }}>
        <div className="empty-icon"><Activity size={22} /></div>
        <div className="empty-title">Activity Timeline</div>
        <div className="empty-subtitle">
          Ticket activities (created, assigned, status changes, messages) are tracked server-side.
          They are visible in the admin panel.
        </div>
      </div>
    </div>
  );
}
