
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import EventDetails from "@/pages/EventDetails";
import Checkout from "@/pages/Checkout";
import PaymentStatus from "@/pages/PaymentStatus";
import CheckoutFinish from "@/pages/CheckoutFinish";
import Admin from "@/pages/Admin";
import AdminFinanceiro from "@/pages/AdminFinanceiro";
import AdminUsers from "@/pages/AdminUsers";
import AdminVouchers from "@/pages/AdminVouchers";
import AdminBatches from "@/pages/AdminBatches";
import AdminParticipants from "@/pages/AdminParticipants";
import AdminParticipantsList from "@/pages/AdminParticipantsList";
import AdminParticipantsSales from "@/pages/AdminParticipantsSales";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import DuplicateEvent from "@/pages/DuplicateEvent";
import Profile from "@/pages/Profile";
import Rewards from "@/pages/Rewards";
import ValidateTicket from "@/pages/ValidateTicket";
import Vouchers from "@/pages/Vouchers";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/evento/:id",
    element: <EventDetails />,
  },
  {
    path: "/checkout/finish",
    element: <CheckoutFinish />,
  },
  {
    path: "/payment-status",
    element: <PaymentStatus />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/financeiro",
    element: <AdminFinanceiro />,
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
  },
  {
    path: "/admin/vouchers",
    element: <AdminVouchers />,
  },
  {
    path: "/admin/batches",
    element: <AdminBatches />,
  },
  {
    path: "/admin/participants",
    element: <AdminParticipants />,
  },
  {
    path: "/admin/participants/list",
    element: <AdminParticipantsList />,
  },
  {
    path: "/admin/participants/sales",
    element: <AdminParticipantsSales />,
  },
  {
    path: "/edit/:id",
    element: <EditEvent />,
  },
  {
    path: "/events/create",
    element: <CreateEvent />,
  },
  {
    path: "/events/:id/duplicate",
    element: <DuplicateEvent />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/rewards",
    element: <Rewards />,
  },
  {
    path: "/validate-ticket",
    element: <ValidateTicket />,
  },
  {
    path: "/vouchers",
    element: <Vouchers />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
