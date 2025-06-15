
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import EditEvent from "./pages/EditEvent";
import CheckoutFinish from "./pages/CheckoutFinish";
import MyTickets from "./pages/MyTickets";
import Vouchers from "./pages/Vouchers";
import Admin from "./pages/Admin";
import AdminFinanceiro from "./pages/AdminFinanceiro";
import AdminParticipants from "./pages/AdminParticipants";
import AdminUsers from "./pages/AdminUsers";
import AdminVouchers from "./pages/AdminVouchers";
import AdminBatches from "./pages/AdminBatches";
import Fidelity from "./pages/Fidelity";
import AdminRewards from "./pages/AdminRewards";
import Referrals from "@/pages/Referrals";
import { useReferralTracking } from "@/hooks/useReferralTracking";

const queryClient = new QueryClient();

function AppContent() {
  useReferralTracking();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/criar" element={<CreateEvent />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/edit/:id" element={<EditEvent />} />
      <Route path="/checkout/finish" element={<CheckoutFinish />} />
      <Route path="/meus-ingressos" element={<MyTickets />} />
      <Route path="/vouchers" element={<Vouchers />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
      <Route path="/admin/participantes" element={<AdminParticipants />} />
      <Route path="/admin/usuarios" element={<AdminUsers />} />
      <Route path="/admin/vouchers" element={<AdminVouchers />} />
      <Route path="/admin/lotes" element={<AdminBatches />} />
      <Route path="/fidelidade" element={<Fidelity />} />
      <Route path="/admin/recompensas" element={<AdminRewards />} />
      <Route path="/referrals" element={<Referrals />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
