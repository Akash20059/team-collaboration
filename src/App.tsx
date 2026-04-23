import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { AdminRoute } from "@/components/AdminRoute";
import { CartDrawer } from "@/components/site/CartDrawer";
import { seedIfEmpty } from "@/lib/adminStore";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Cart from "./pages/Cart.tsx";
import CheckoutPay from "./pages/CheckoutPay.tsx";
import OrderConfirmed from "./pages/OrderConfirmed.tsx";
import TrackOrder from "./pages/TrackOrder.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminCows from "./pages/admin/AdminCows.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";

// Seed default data on first visit
seedIfEmpty();

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
              <Route path="/checkout/address" element={<Navigate to="/cart" replace />} />
              <Route path="/checkout/payment" element={<Navigate to="/cart" replace />} />
              <Route path="/checkout/pay/:orderId" element={<CheckoutPay />} />
              <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/admin/cows" element={<AdminRoute><AdminCows /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
