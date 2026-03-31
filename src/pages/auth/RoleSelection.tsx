import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Briefcase, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/state/auth';
import { toast } from 'sonner';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loadingRole, setLoadingRole] = useState<'CLIENT' | 'WEALTH_MANAGER' | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    } else if (user.role && user.role !== 'NONE') {
      navigate(user.role === 'CLIENT' ? '/client' : '/manager');
    }
  }, [user, navigate]);

  const selectRole = async (role: 'CLIENT' | 'WEALTH_MANAGER') => {
    if (!user?.token) return;
    setLoadingRole(role);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ role })
      });

      const data = await response.json();
      if (data.success) {
        updateUser({ role: data.data.role });
        toast.success(`Role selected successfully!`);
        navigate(role === 'CLIENT' ? '/client' : '/manager');
      } else {
        throw new Error(data.error || 'Failed to set role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error configuring account');
    } finally {
      setLoadingRole(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Select Your Role</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Choose how you will be using the DFNS Hedera Custody Platform. You cannot change this later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
          {/* Client Option */}
          <div className="relative group cursor-pointer" onClick={() => selectRole('CLIENT')}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl transition-all duration-300 group-hover:from-primary/20 group-hover:to-accent/10" />
            <div className="relative p-8 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm h-full flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-xl mb-6 text-primary">
                <UserCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Client</h3>
              <p className="text-muted-foreground flex-grow">
                Manage your own digital assets with 2-of-3 MPC security. Initiate transactions and connect safely to the Hedera network.
              </p>
              <Button 
                className="mt-8 w-full transition-all group-hover:bg-primary"
                disabled={loadingRole !== null}
              >
                {loadingRole === 'CLIENT' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Select Client
              </Button>
            </div>
          </div>

          {/* Wealth Manager Option */}
          <div className="relative group cursor-pointer" onClick={() => selectRole('WEALTH_MANAGER')}>
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-2xl transition-all duration-300 group-hover:from-purple-500/20 group-hover:to-blue-500/10" />
            <div className="relative p-8 rounded-2xl border border-purple-500/20 bg-card/60 backdrop-blur-sm h-full flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="p-3 bg-purple-500/10 rounded-xl mb-6 text-purple-400">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Wealth Manager</h3>
              <p className="text-muted-foreground flex-grow">
                Review, approve, and finalize multi-signature transactions for your clients. Maintain complete oversight and audit logs.
              </p>
              <Button 
                variant="secondary"
                className="mt-8 w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all border border-purple-500/20"
                disabled={loadingRole !== null}
              >
                {loadingRole === 'WEALTH_MANAGER' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Select Wealth Manager
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
