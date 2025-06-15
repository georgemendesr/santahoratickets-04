
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import CheckoutFinish from "./pages/CheckoutFinish";
import PaymentStatus from "./pages/PaymentStatus";
import Fidelity from "./pages/Fidelity";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import DuplicateEvent from "./pages/DuplicateEvent";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminBatches from "./pages/AdminBatches";
import AdminParticipants from "./pages/AdminParticipants";
import AdminParticipantsList from "./pages/AdminParticipantsList";
import AdminParticipantsSales from "./pages/AdminParticipantsSales";
import AdminFinanceiro from "./pages/AdminFinanceiro";
import AdminReports from "./pages/AdminReports";
import AdminVouchers from "./pages/AdminVouchers";
import AdminRewards from "./pages/AdminRewards";
import AdminEventCheckins from "./pages/AdminEventCheckins";
import Referrals from "./pages/Referrals";
import Rewards from "./pages/Rewards";
import ValidateTicket from "./pages/ValidateTicket";
import Vouchers from "./pages/Vouchers";
import TestingDashboard from "./pages/TestingDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/evento/:id" element={<EventDetails />} />
              <Route path="/eventos/criar" element={<CreateEvent />} />
              <Route path="/eventos/:id/editar" element={<EditEvent />} />
              <Route path="/eventos/:id/duplicar" element={<DuplicateEvent />} />
              <Route path="/meus-ingressos" element={<MyTickets />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/checkout/:eventId" element={<Checkout />} />
              <Route path="/checkout-finish" element={<CheckoutFinish />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
              <Route path="/fidelidade" element={<Fidelity />} />
              <Route path="/indicacoes" element={<Referrals />} />
              <Route path="/recompensas" element={<Rewards />} />
              <Route path="/validar-ingresso" element={<ValidateTicket />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/lotes" element={<AdminBatches />} />
              <Route path="/admin/participantes" element={<AdminParticipants />} />
              <Route path="/admin/participantes/lista" element={<AdminParticipantsList />} />
              <Route path="/admin/participantes/vendas" element={<AdminParticipantsSales />} />
              <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
              <Route path="/admin/relatorios" element={<AdminReports />} />
              <Route path="/admin/vouchers" element={<AdminVouchers />} />
              <Route path="/admin/recompensas" element={<AdminRewards />} />
              <Route path="/admin/eventos/:eventId/checkins" element={<AdminEventCheckins />} />
              <Route path="/testing" element={<TestingDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
