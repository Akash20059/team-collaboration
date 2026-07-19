// ─── Shared API helper for the Express backend ───────────────────────────────
// In production this points to the Render service URL; locally it falls back to localhost:3001
// In production (Vercel), frontend and backend are on the SAME domain, so we use relative path.
// In local dev, Vite runs on 5173/8080 and Express runs on 3001, so we point to localhost.
const BASE = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";
async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ─── Products ────────────────────────────────────────────────────────────
  getProducts: () => apiFetch<any[]>("/products"),
  createProduct: (data: any) => apiFetch<any>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => apiFetch<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch<any>(`/products/${id}`, { method: "DELETE" }),

  // ─── Cows ────────────────────────────────────────────────────────────────
  getCows: () => apiFetch<any[]>("/cows"),
  createCow: (data: any) => apiFetch<any>("/cows", { method: "POST", body: JSON.stringify(data) }),
  updateCow: (id: string, data: any) => apiFetch<any>(`/cows/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCow: (id: string) => apiFetch<any>(`/cows/${id}`, { method: "DELETE" }),

  // ─── Blog ─────────────────────────────────────────────────────────────────
  getBlogPosts: () => apiFetch<any[]>("/blog"),
  createBlogPost: (data: any) => apiFetch<any>("/blog", { method: "POST", body: JSON.stringify(data) }),
  updateBlogPost: (id: string, data: any) => apiFetch<any>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBlogPost: (id: string) => apiFetch<any>(`/blog/${id}`, { method: "DELETE" }),

  // ─── Donors ───────────────────────────────────────────────────────────────
  getDonors: () => apiFetch<any[]>("/donors"),
  createDonor: (data: any) => apiFetch<any>("/donors", { method: "POST", body: JSON.stringify(data) }),
  updateDonor: (id: string, data: any) => apiFetch<any>(`/donors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDonor: (id: string) => apiFetch<any>(`/donors/${id}`, { method: "DELETE" }),

  // ─── Orders ───────────────────────────────────────────────────────────────
  getOrders: (status?: string) => apiFetch<any[]>(`/orders${status ? `?status=${status}` : ""}`),
  createOrder: (data: any) => apiFetch<any>("/orders/place", { method: "POST", body: JSON.stringify(data) }),
  dispatchOrder: (orderId: string, data: { tracking_number: string; courier_partner?: string }) =>
    apiFetch<any>(`/orders/${orderId}/dispatch`, { method: "PUT", body: JSON.stringify(data) }),
  updateTracking: (orderId: string, tracking_number: string) =>
    apiFetch<any>(`/orders/${orderId}/tracking`, { method: "PUT", body: JSON.stringify({ tracking_number }) }),
  updateOrderStatus: (orderId: string, data: any) =>
    apiFetch<any>(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify(data) }),

  // ─── Auth ─────────────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; user: any; access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<any>("/auth/logout", { method: "POST" }),

  // ─── Stats ────────────────────────────────────────────────────────────────
  getStats: () => apiFetch<any>("/stats"),

  // ─── Gallery ──────────────────────────────────────────────────────────────
  getGallery: () => apiFetch<any[]>("/gallery"),
  createGalleryImage: (data: any) => apiFetch<any>("/gallery", { method: "POST", body: JSON.stringify(data) }),
  updateGalleryImage: (id: string, data: any) => apiFetch<any>(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGalleryImage: (id: string) => apiFetch<any>(`/gallery/${id}`, { method: "DELETE" }),

  // ─── Payments ─────────────────────────────────────────────────────────────
  createPaymentOrder: (data: { amount: number; receipt?: string }) => 
    apiFetch<any>("/payments/create-order", { method: "POST", body: JSON.stringify(data) }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => 
    apiFetch<{ success: boolean; message?: string; error?: string }>("/payments/verify", { method: "POST", body: JSON.stringify(data) }),
};
