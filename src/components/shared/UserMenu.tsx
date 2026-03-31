import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/state/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { authService } from '@/api/auth';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch(err) {
      console.error(err);
    }
    logout();
    navigate('/');
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm font-medium text-success truncate max-w-[140px]">
          {user.email}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="text-muted-foreground hover:text-destructive"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
