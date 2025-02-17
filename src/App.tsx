
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import EventDetails from "@/pages/EventDetails";
import CheckoutFinish from "@/pages/CheckoutFinish";
import PaymentStatus from "@/pages/PaymentStatus";
import Profile from "@/pages/Profile";
import Vouchers from "@/pages/Vouchers";
import Rewards from "@/pages/Rewards";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/evento/:id" element={<EventDetails />} />
          <Route path="/checkout/finish" element={<CheckoutFinish />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/meus-vouchers" element={<Vouchers />} />
          <Route path="/recompensas" element={<Rewards />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
