
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import EventDetails from "@/pages/EventDetails";
import ValidateTicket from "@/pages/ValidateTicket";
import Rewards from "@/pages/Rewards";
import NotFound from "@/pages/NotFound";
import Checkout from "@/pages/Checkout";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/edit/:id" element={<EditEvent />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/validate" element={<ValidateTicket />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
