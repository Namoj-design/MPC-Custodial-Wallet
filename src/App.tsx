import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/state/auth";
import { WalletProvider } from "@/state/wallet";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import RoleSelection from "./pages/auth/RoleSelection";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import NewTransaction from "./pages/client/NewTransaction";
import TransactionReview from "./pages/client/TransactionReview";
import TransactionHistory from "./pages/client/TransactionHistory";
import WalletSetup from "./pages/client/WalletSetup";

// Wealth Manager Pages
import ManagerDashboard from "./pages/manager/Dashboard";
import Approvals from "./pages/manager/Approvals";
import TransactionDetail from "./pages/manager/TransactionDetail";
import AuditLogs from "./pages/manager/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/role-selection" element={<RoleSelection />} />
              
              {/* Client Routes */}
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/client/wallet/setup" element={<WalletSetup />} />
              <Route path="/client/transaction/new" element={<NewTransaction />} />
              <Route path="/client/transaction/review/:id" element={<TransactionReview />} />
              <Route path="/client/transactions" element={<TransactionHistory />} />
              
              {/* Wealth Manager Routes */}
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/approvals" element={<Approvals />} />
              <Route path="/manager/transactions/:id" element={<TransactionDetail />} />
              <Route path="/manager/audit" element={<AuditLogs />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
