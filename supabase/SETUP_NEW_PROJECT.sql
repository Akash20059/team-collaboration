-- ============================================================
--  Shreemata Goumandira — Full Database Setup
--  Run this ENTIRE file ONCE in the Supabase SQL Editor.
-- ============================================================

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE public.health_status AS ENUM ('healthy', 'under_treatment', 'pregnant', 'new_born');
CREATE TYPE public.blog_category AS ENUM ('new_born_calf', 'program', 'function', 'general_update');
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE public.order_status AS ENUM ('order_placed', 'payment_verified', 'packing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('upi', 'bank_transfer', 'cod');

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by self" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES + has_role ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-CREATE PROFILE + AUTO-ADMIN ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  IF NEW.email = 'shreematagomandira@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  mrp NUMERIC(10,2),
  quantity_available INTEGER NOT NULL DEFAULT 0,
  stock_status stock_status NOT NULL DEFAULT 'in_stock',
  image_url TEXT,
  order_link TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_available <= 0 THEN NEW.stock_status = 'out_of_stock';
  ELSIF NEW.quantity_available < 5 THEN NEW.stock_status = 'low_stock';
  ELSE NEW.stock_status = 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER products_sync_stock BEFORE INSERT OR UPDATE OF quantity_available ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.sync_stock_status();

-- ============ COWS ============
CREATE TABLE public.cows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cow_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age TEXT,
  weight_kg NUMERIC(6,2),
  breed TEXT DEFAULT 'Malenadu Gidda',
  father_name TEXT,
  mother_name TEXT,
  milk_yield_litres NUMERIC(5,2),
  health_status health_status NOT NULL DEFAULT 'healthy',
  is_adopted BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cows viewable by everyone" ON public.cows FOR SELECT USING (true);
CREATE POLICY "Admins manage cows" ON public.cows FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_cows_updated_at BEFORE UPDATE ON public.cows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BLOG POSTS ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category blog_category NOT NULL DEFAULT 'general_update',
  post_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cover_image_url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts viewable by everyone" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ORDERS ============
CREATE SEQUENCE public.order_seq START 1;
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RETURN 'GOU-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(nextval('public.order_seq')::TEXT, 4, '0');
END;
$$;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE DEFAULT public.generate_order_id(),
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  customer_email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL DEFAULT 'upi',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  order_status order_status NOT NULL DEFAULT 'order_placed',
  courier_partner TEXT,
  awb_number TEXT,
  tracking_url TEXT,
  expected_delivery DATE,
  internal_notes TEXT,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders viewable by everyone for tracking" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.append_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || jsonb_build_object(
      'status', NEW.order_status::text, 'at', now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER orders_track_status BEFORE INSERT OR UPDATE OF order_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.append_order_status_history();

CREATE OR REPLACE FUNCTION public.validate_order()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.customer_name) < 2 OR length(NEW.customer_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF NEW.customer_mobile !~ '^[0-9]{10}$' THEN
    RAISE EXCEPTION 'Mobile must be 10 digits';
  END IF;
  IF NEW.pincode !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'Pincode must be 6 digits';
  END IF;
  IF jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  IF NEW.total_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid total';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER orders_validate BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order();

CREATE INDEX idx_orders_order_id ON public.orders(order_id);
CREATE INDEX idx_orders_mobile ON public.orders(customer_mobile);

-- ============ SAVED ADDRESSES ============
CREATE TABLE public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  pincode TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.saved_addresses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('cow-images', 'cow-images', true),
  ('blog-images', 'blog-images', true);

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read cow images" ON storage.objects FOR SELECT USING (bucket_id = 'cow-images');
CREATE POLICY "Admins upload cow images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cow-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update cow images" ON storage.objects FOR UPDATE USING (bucket_id = 'cow-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cow images" ON storage.objects FOR DELETE USING (bucket_id = 'cow-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

-- ============ ONE-TIME DONATIONS ============
CREATE TABLE public.one_time_donations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  amount          INTEGER NOT NULL DEFAULT 12000,
  message         TEXT,
  donated_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.one_time_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record donation"
  ON public.one_time_donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view donations"
  ON public.one_time_donations FOR SELECT USING (true);
CREATE POLICY "Admins update donations"
  ON public.one_time_donations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete donations"
  ON public.one_time_donations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ MONTHLY DONORS (new) ============
CREATE TABLE public.monthly_donors (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  email              TEXT,
  phone              TEXT,
  amount             INTEGER NOT NULL,
  last_payment_date  DATE,
  next_reminder_date DATE NOT NULL,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monthly_donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register as donor"
  ON public.monthly_donors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage monthly donors"
  ON public.monthly_donors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_monthly_donors_reminder
  ON public.monthly_donors(next_reminder_date) WHERE is_active = true;
