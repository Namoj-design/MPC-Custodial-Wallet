import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Auth Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import KYC from "@/pages/KYC";

// Client Pages
import ClientDashboard from "@/pages/client/Dashboard";
import Wallet from "@/pages/client/Wallet";
import Transactions from "@/pages/client/Transactions";
import MPCRequests from "@/pages/client/MPCRequests";
import Recovery from "@/pages/client/Recovery";
import Settings from "@/pages/client/Settings";

// Manager Pages
import ManagerDashboard from "@/pages/manager/Dashboard";
import Approvals from "@/pages/manager/Approvals";
import Policies from "@/pages/manager/Policies";
import Keys from "@/pages/manager/Keys";
import Logs from "@/pages/manager/Logs";
import Users from "@/pages/manager/Users";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/kyc" element={<KYC />} />

            {/* Root redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Client Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/mpc-requests" element={<MPCRequests />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/approvals" element={<Approvals />} />
              <Route path="/manager/policies" element={<Policies />} />
              <Route path="/manager/keys" element={<Keys />} />
              <Route path="/manager/logs" element={<Logs />} />
              <Route path="/manager/users" element={<Users />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
