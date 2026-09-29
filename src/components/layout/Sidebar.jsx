import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  LogOut,
  Headphones,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { ROLES } from '../../lib/utils';

const NAV_ITEMS = {
  [ROLES.CUSTOMER]: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'My Tickets', icon: Ticket },
  ],
  [ROLES.SUPPORT_AGENT]: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Assigned Tickets', icon: Ticket },
  ],
  [ROLES.SUPPORT_ADMIN]: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'All Tickets', icon: Ticket },
    { to: '/agents', label: 'Agents', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Headphones size={16} color="#fff" />
        </div>
        <span className="sidebar-logo-text">
          Support<span>ly</span>
        </span>
      </div>
      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon">
              <Icon size={15} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <Avatar name={fullName} size="sm" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{fullName || 'User'}</div>
            <div className="sidebar-user-role">{user?.role?.replace(/_/g, ' ').toLowerCase()}</div>
          </div>
          <LogOut size={13} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
}
