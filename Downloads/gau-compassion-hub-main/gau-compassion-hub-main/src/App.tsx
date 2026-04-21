import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { AdminRoute } from "@/components/AdminRoute";
import { CartDrawer } from "@/components/site/CartDrawer";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Cart from "./pages/Cart.tsx";
import CheckoutAddress from "./pages/CheckoutAddress.tsx";
import CheckoutPayment from "./pages/CheckoutPayment.tsx";
import OrderConfirmed from "./pages/OrderConfirmed.tsx";
import TrackOrder from "./pages/TrackOrder.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminCows from "./pages/admin/AdminCows.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/address" element={<CheckoutAddress />} />
              <Route path="/checkout/payment" element={<CheckoutPayment />} />
              <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/admin/cows" element={<AdminRoute><AdminCows /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
