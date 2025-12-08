import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { NeuralBackground } from '@/components/NeuralBackground';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NeuralBackground />
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="p-6 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
