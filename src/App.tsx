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

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import EditEvent from "./pages/EditEvent";
import CheckoutFinish from "./pages/CheckoutFinish";
import MyTickets from "./pages/MyTickets";
import Vouchers from "./pages/Vouchers";
import Admin from "./pages/Admin";
import AdminFinanceiro from "./pages/AdminFinanceiro";
import AdminParticipantes from "./pages/AdminParticipantes";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminVouchers from "./pages/AdminVouchers";
import Fidelity from "./pages/Fidelity";
import AdminRewards from "./pages/AdminRewards";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/edit/:id" element={<EditEvent />} />
          <Route path="/checkout/finish" element={<CheckoutFinish />} />
          <Route path="/meus-ingressos" element={<MyTickets />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
          <Route path="/admin/participantes" element={<AdminParticipantes />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/vouchers" element={<AdminVouchers />} />
          <Route path="/fidelidade" element={<Fidelity />} />
          <Route path="/admin/recompensas" element={<AdminRewards />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
