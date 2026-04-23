// ─── Admin Data Store (localStorage-backed) ───────────────────────────────
// All admin-managed data lives here. Public pages read from these same functions.

import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";
import ghee from "@/assets/product-ghee.jpg";
import dhoopa from "@/assets/product-dhoopa.jpg";
import soap from "@/assets/product-soap.jpg";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  quantity_available: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  image_url: string | null;
  order_link: string;
  created_at: string;
}

export type HealthStatus = "healthy" | "under_treatment" | "pregnant" | "new_born";

export interface Cow {
  id: string;
  cow_number: number;
  name: string;
  age: string;
  weight_kg: number;
  breed: string;
  father_name?: string | null;
  mother_name?: string | null;
  milk_yield_litres: number;
  health_status: HealthStatus;
  is_adopted: boolean;
  photo_url: string | null;
  notes: string;
  created_at: string;
}

export type BlogCategory = "new_born_calf" | "program" | "function" | "general_update";

export type DonationType = "one-time" | "monthly";

export interface Donor {
  id: string;
  name: string;
  type: DonationType;
  amount: number;
  donated_at: string;
  message?: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: BlogCategory;
  post_date: string;
  cover_image_url: string | null;
  content: string;
  created_at: string;
}

// ─── Storage Keys ──────────────────────────────────────────────────────────

const KEYS = {
  products: "admin_products",
  cows: "admin_cows",
  blog: "admin_blog",
  donors: "admin_donors",
  seeded: "admin_seeded",
} as const;

// ─── UUID helper ───────────────────────────────────────────────────────────

const uuid = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ─── Generic helpers ───────────────────────────────────────────────────────

function getList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setList<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Stock status auto-calculation ─────────────────────────────────────────

export function calcStockStatus(quantity: number): Product["stock_status"] {
  if (quantity <= 0) return "out_of_stock";
  if (quantity < 5) return "low_stock";
  return "in_stock";
}

// ─── Products CRUD ─────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return getList<Product>(KEYS.products);
}

export function saveProduct(data: Omit<Product, "id" | "created_at"> & { id?: string }): Product {
  const list = getProducts();
  const stockStatus = calcStockStatus(data.quantity_available);
  if (data.id) {
    // Update
    const idx = list.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, stock_status: stockStatus, id: data.id };
      setList(KEYS.products, list);
      return list[idx];
    }
  }
  // Create
  const item: Product = {
    ...data,
    id: uuid(),
    stock_status: stockStatus,
    created_at: new Date().toISOString(),
  };
  list.unshift(item);
  setList(KEYS.products, list);
  return item;
}

export function deleteProduct(id: string): void {
  setList(KEYS.products, getProducts().filter((p) => p.id !== id));
}

// ─── Cows CRUD ─────────────────────────────────────────────────────────────

export function getCows(): Cow[] {
  return getList<Cow>(KEYS.cows);
}

export function saveCow(data: Omit<Cow, "id" | "created_at"> & { id?: string }): Cow {
  const list = getCows();
  if (data.id) {
    const idx = list.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setList(KEYS.cows, list);
      return list[idx];
    }
  }
  const item: Cow = { ...data, id: uuid(), created_at: new Date().toISOString() };
  list.push(item);
  // Sort by cow_number
  list.sort((a, b) => a.cow_number - b.cow_number);
  setList(KEYS.cows, list);
  return item;
}

export function deleteCow(id: string): void {
  setList(KEYS.cows, getCows().filter((c) => c.id !== id));
}

// ─── Blog CRUD ─────────────────────────────────────────────────────────────

export function getBlogPosts(): BlogPost[] {
  return getList<BlogPost>(KEYS.blog);
}

export function saveBlogPost(data: Omit<BlogPost, "id" | "created_at"> & { id?: string }): BlogPost {
  const list = getBlogPosts();
  if (data.id) {
    const idx = list.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setList(KEYS.blog, list);
      return list[idx];
    }
  }
  const item: BlogPost = { ...data, id: uuid(), created_at: new Date().toISOString() };
  list.unshift(item);
  setList(KEYS.blog, list);
  return item;
}

export function deleteBlogPost(id: string): void {
  setList(KEYS.blog, getBlogPosts().filter((p) => p.id !== id));
}

// ─── Donors CRUD ───────────────────────────────────────────────────────────

export function getDonors(): Donor[] {
  return getList<Donor>(KEYS.donors).sort(
    (a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime()
  );
}

export function saveDonor(data: Omit<Donor, "id" | "created_at"> & { id?: string }): Donor {
  const list = getDonors();
  if (data.id) {
    const idx = list.findIndex((d) => d.id === data.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setList(KEYS.donors, list);
      return list[idx];
    }
  }
  const item: Donor = { ...data, id: uuid(), created_at: new Date().toISOString() };
  list.unshift(item);
  setList(KEYS.donors, list);
  return item;
}

export function deleteDonor(id: string): void {
  setList(KEYS.donors, getDonors().filter((d) => d.id !== id));
}

// ─── Export / Import ───────────────────────────────────────────────────────

export function exportAllData(): string {
  return JSON.stringify(
    {
      products: getProducts(),
      cows: getCows(),
      blog_posts: getBlogPosts(),
      exported_at: new Date().toISOString(),
    },
    null,
    2,
  );
}

export function importAllData(json: string): void {
  const data = JSON.parse(json);
  if (data.products) setList(KEYS.products, data.products);
  if (data.cows) setList(KEYS.cows, data.cows);
  if (data.blog_posts) setList(KEYS.blog, data.blog_posts);
}

export function downloadExport(): void {
  const blob = new Blob([exportAllData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `goumandira-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Seed Data (runs once on first visit) ──────────────────────────────────

export function seedIfEmpty(): void {
  if (localStorage.getItem(KEYS.seeded)) return;

  // Seed cows
  if (getCows().length === 0) {
    const seedCows: Cow[] = [
      {
        id: uuid(), cow_number: 1, name: "Gowri", age: "4 years", weight_kg: 210,
        breed: "Malenadu Gidda", milk_yield_litres: 3.5, health_status: "healthy",
        is_adopted: false, photo_url: cow1, notes: "Gentle and calm, loves morning grazing in the forest meadow.",
        created_at: new Date().toISOString(),
      },
      {
        id: uuid(), cow_number: 2, name: "Kamadhenu", age: "6 years", weight_kg: 245,
        breed: "Malenadu Gidda", milk_yield_litres: 4.2, health_status: "pregnant",
        is_adopted: true, photo_url: cow2, notes: "Expecting her second calf. She enjoys the evening temple bells.",
        created_at: new Date().toISOString(),
      },
      {
        id: uuid(), cow_number: 3, name: "Nandini", age: "3 years", weight_kg: 185,
        breed: "Malenadu Gidda", milk_yield_litres: 2.8, health_status: "healthy",
        is_adopted: false, photo_url: cow3, notes: "Young and spirited — the youngest of our sacred herd.",
        created_at: new Date().toISOString(),
      },
    ];
    setList(KEYS.cows, seedCows);
  }

  // Seed products
  if (getProducts().length === 0) {
    const seedProducts: Product[] = [
      {
        id: uuid(), name: "Pure Desi Ghee", description: "Traditional A2 ghee from our Malenadu Gidda cows, made using the bilona method.",
        price: 850, mrp: 1000, quantity_available: 25, stock_status: "in_stock",
        image_url: ghee, order_link: "", created_at: new Date().toISOString(),
      },
      {
        id: uuid(), name: "Cow Dung Dhoopa Sticks", description: "Natural incense sticks made from cow dung, ideal for daily puja.",
        price: 150, mrp: 200, quantity_available: 50, stock_status: "in_stock",
        image_url: dhoopa, order_link: "", created_at: new Date().toISOString(),
      },
      {
        id: uuid(), name: "Herbal Cow Soap", description: "Handmade soap with cow milk and ayurvedic herbs for soft, glowing skin.",
        price: 120, mrp: 150, quantity_available: 3, stock_status: "low_stock",
        image_url: soap, order_link: "", created_at: new Date().toISOString(),
      },
    ];
    setList(KEYS.products, seedProducts);
  }

  // Seed blog posts
  if (getBlogPosts().length === 0) {
    const seedPosts: BlogPost[] = [
      {
        id: uuid(), title: "New Calf Born at Goumandira!", category: "new_born_calf",
        post_date: "2026-04-15", cover_image_url: cow1,
        content: "We are blessed to welcome a healthy new calf to our gaushala family. Mother and baby are both doing well. The calf has been named after the morning star. 🐮🙏",
        created_at: new Date().toISOString(),
      },
      {
        id: uuid(), title: "Annual Go Puja Celebration 2026", category: "function",
        post_date: "2026-04-10", cover_image_url: cow2,
        content: "Our annual Go Puja was celebrated with great devotion. Over 200 devotees participated in the sacred ritual honoring our Gau Mata. Special prasadam was distributed to all. 🎉",
        created_at: new Date().toISOString(),
      },
      {
        id: uuid(), title: "Organic Fodder Program Launched", category: "program",
        post_date: "2026-04-01", cover_image_url: cow3,
        content: "We have initiated a new organic fodder cultivation program on 2 acres of land. This ensures our cows receive the most nutritious and chemical-free feed year-round. 🌿",
        created_at: new Date().toISOString(),
      },
    ];
    setList(KEYS.blog, seedPosts);
  }

  localStorage.setItem(KEYS.seeded, "true");
}
