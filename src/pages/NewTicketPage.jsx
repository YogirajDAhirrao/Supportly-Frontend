import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ArrowLeft } from 'lucide-react';
import { ticketsApi } from '../lib/api';

// Hardcoded common categories since there's no dedicated /categories/ API endpoint
// In production these would come from an API
const CATEGORIES_PLACEHOLDER = [
  { id: '', name: 'Select a category…' },
];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category_id: '',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const errs = {};
    if (!form.category_id) errs.category_id = 'Please select a category.';
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await ticketsApi.create(form);
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrs = {};
        Object.entries(data).forEach(([k, v]) => {
          fieldErrs[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(fieldErrs);
      } else {
        setGlobalError('Failed to create ticket. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-heading">
        <div className="page-heading-left">
          <h1>New Support Ticket</h1>
          <p>Describe your issue and we&apos;ll get back to you as soon as possible.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Ticket size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Ticket Details
            </span>
          </div>
          <div className="card-body">
            {globalError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{globalError}</div>
            )}

            <form onSubmit={handleSubmit} id="new-ticket-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-category">Category UUID</label>
                <input
                  id="ticket-category"
                  name="category_id"
                  type="text"
                  placeholder="Enter category UUID (from admin)"
                  value={form.category_id}
                  onChange={handleChange}
                  style={errors.category_id ? { borderColor: '#ef4444' } : {}}
                />
                {errors.category_id && <span className="form-error">{errors.category_id}</span>}
                <span className="form-hint">You can get category UUIDs from your admin panel.</span>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-subject">Subject</label>
                <input
                  id="ticket-subject"
                  name="subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={255}
                  style={errors.subject ? { borderColor: '#ef4444' } : {}}
                  required
                />
                {errors.subject && <span className="form-error">{errors.subject}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-description">Description</label>
                <textarea
                  id="ticket-description"
                  name="description"
                  placeholder="Please provide as much detail as possible about the issue, steps to reproduce, and any error messages you saw…"
                  value={form.description}
                  onChange={handleChange}
                  style={{ minHeight: 160, ...(errors.description ? { borderColor: '#ef4444' } : {}) }}
                  required
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-priority">Priority</label>
                <select
                  id="ticket-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">Low — Minor issue, no urgency</option>
                  <option value="MEDIUM">Medium — Normal issue</option>
                  <option value="HIGH">High — Significant impact</option>
                  <option value="URGENT">Urgent — Critical, blocking work</option>
                </select>
                {errors.priority && <span className="form-error">{errors.priority}</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  id="submit-ticket-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</>
                  ) : (
                    <><Ticket size={15} /> Submit Ticket</>
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
