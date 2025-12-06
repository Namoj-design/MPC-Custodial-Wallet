import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Shield,
  Settings,
  Key,
  Users,
  CheckSquare,
  FileText,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const clientLinks = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/mpc-requests', icon: Shield, label: 'MPC Requests' },
  { to: '/recovery', icon: Key, label: 'VSS Recovery' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerLinks = [
  { to: '/manager', icon: Home, label: 'Dashboard' },
  { to: '/manager/approvals', icon: CheckSquare, label: 'Approvals' },
  { to: '/manager/policies', icon: FileText, label: 'Policies' },
  { to: '/manager/keys', icon: Key, label: 'Key Shards' },
  { to: '/manager/logs', icon: Activity, label: 'MPC Logs' },
  { to: '/manager/users', icon: Users, label: 'Users' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user?.role === 'manager' ? managerLinks : clientLinks;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-border/50 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Elliptic</h1>
              <p className="text-xs text-muted-foreground">MPC Wallet</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
              <span className="text-sm font-semibold text-secondary-foreground">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
