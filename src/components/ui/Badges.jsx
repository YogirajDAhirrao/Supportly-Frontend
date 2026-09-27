import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../lib/utils';

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'status-open' };
  const cssClass = cfg.color;
  return (
    <span className={`badge ${cssClass}`}>
      <span className="badge-dot" />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || { label: priority, color: 'priority-medium' };
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
}

export function RoleBadge({ role }) {
  const map = {
    CUSTOMER: { label: 'Customer', cls: 'role-badge-customer' },
    SUPPORT_AGENT: { label: 'Agent', cls: 'role-badge-agent' },
    SUPPORT_ADMIN: { label: 'Admin', cls: 'role-badge-admin' },
  };
  const cfg = map[role] || { label: role, cls: 'role-badge-customer' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
