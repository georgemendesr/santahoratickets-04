
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import AdminUsers from "@/pages/AdminUsers";
import AdminVouchers from "@/pages/AdminVouchers";
import AdminFinancial from "@/pages/AdminFinancial";
import Auth from "@/pages/Auth";
import CreateEvent from "@/pages/CreateEvent";
import DuplicateEvent from "@/pages/DuplicateEvent";
import EditEvent from "@/pages/EditEvent";
import EventDetails from "@/pages/EventDetails";
import Profile from "@/pages/Profile";
import Rewards from "@/pages/Rewards";
import ValidateTicket from "@/pages/ValidateTicket";
import Vouchers from "@/pages/Vouchers";
import NotFound from "@/pages/NotFound";
import Checkout from "@/pages/Checkout";
import CheckoutFinish from "@/pages/CheckoutFinish";
import PaymentStatus from "@/pages/PaymentStatus";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/usuarios",
    element: <AdminUsers />,
  },
  {
    path: "/admin/vouchers",
    element: <AdminVouchers />,
  },
  {
    path: "/admin/financeiro",
    element: <AdminFinancial />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/criar-evento",
    element: <CreateEvent />,
  },
  {
    path: "/duplicar-evento/:id",
    element: <DuplicateEvent />,
  },
  {
    path: "/editar-evento/:id",
    element: <EditEvent />,
  },
  {
    path: "/evento/:id",
    element: <EventDetails />,
  },
  {
    path: "/perfil",
    element: <Profile />,
  },
  {
    path: "/recompensas",
    element: <Rewards />,
  },
  {
    path: "/validar-ingresso",
    element: <ValidateTicket />,
  },
  {
    path: "/meus-ingressos",
    element: <Vouchers />,
  },
  {
    path: "/checkout/:eventId",
    element: <Checkout />,
  },
  {
    path: "/checkout/:eventId/finalizar",
    element: <CheckoutFinish />,
  },
  {
    path: "/pagamento/:paymentId",
    element: <PaymentStatus />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
