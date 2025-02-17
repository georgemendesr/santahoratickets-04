
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import EventDetails from "@/pages/EventDetails";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import CheckoutFinish from "@/pages/CheckoutFinish";
import PaymentStatus from "@/pages/PaymentStatus";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout/finish" element={<CheckoutFinish />} />
          <Route path="/payment/:status" element={<PaymentStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
