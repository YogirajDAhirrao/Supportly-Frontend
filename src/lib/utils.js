// Ticket status and priority helpers

export const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    color: 'status-open',
    dot: '#3b82f6',
  },
  ASSIGNED: {
    label: 'Assigned',
    color: 'status-assigned',
    dot: '#8b5cf6',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'status-in-progress',
    dot: '#f59e0b',
  },
  WAITING_FOR_CUSTOMER: {
    label: 'Waiting',
    color: 'status-waiting',
    dot: '#6b7280',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'status-resolved',
    dot: '#10b981',
  },
  CLOSED: {
    label: 'Closed',
    color: 'status-closed',
    dot: '#374151',
  },
};

export const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    color: 'priority-low',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'priority-medium',
  },
  HIGH: {
    label: 'High',
    color: 'priority-high',
  },
  URGENT: {
    label: 'Urgent',
    color: 'priority-urgent',
  },
};

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  SUPPORT_ADMIN: 'SUPPORT_ADMIN',
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Status transition map (mirrors backend logic)
export const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  WAITING_FOR_CUSTOMER: [],
};
