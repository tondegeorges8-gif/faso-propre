import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewReport from "./pages/NewReport";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CollectorDashboard from "./pages/CollectorDashboard";
import FounderDashboard from "./pages/FounderDashboard";
import LoyaltyPage from "./pages/LoyaltyPage";
import SponsorsAdmin from "./pages/SponsorsAdmin";
import Profile from "./pages/Profile";
import Prestataires from "./pages/Prestataires";
import PrestatairesAdmin from "./pages/PrestatairesAdmin";
import PrestataireProfile from "./pages/PrestataireProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-report" element={<NewReport />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/collector" element={<CollectorDashboard />} />
            <Route path="/founder" element={<FounderDashboard />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/sponsors" element={<SponsorsAdmin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prestataires" element={<Prestataires />} />
            <Route path="/admin/prestataires" element={<PrestatairesAdmin />} />
            <Route path="/prestataires/:metier" element={<Prestataires />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
