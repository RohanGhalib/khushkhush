-- Supabase Schema for KhushKhush

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  college TEXT DEFAULT '',
  referral_code TEXT DEFAULT '',
  ambassador_status TEXT DEFAULT 'rejected',
  instagram_handle TEXT DEFAULT '',
  ambassador_pitch TEXT DEFAULT '',
  khush_coins INTEGER NOT NULL DEFAULT 0,
  khush_coins_earned INTEGER NOT NULL DEFAULT 0,
  khush_coins_spent INTEGER NOT NULL DEFAULT 0,
  ambassador_sales INTEGER NOT NULL DEFAULT 0,
  ambassador_referral_uses INTEGER NOT NULL DEFAULT 0,
  wishlist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT '',
  collection_slug TEXT DEFAULT '',
  sizes JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Active',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  shipping_address JSONB DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  shipping NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Processing',
  applied_coupon TEXT,
  referral_code TEXT,
  coins_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NEWSLETTER TABLE
CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VAULT TABLE
CREATE TABLE IF NOT EXISTS public.vault (
  id TEXT PRIMARY KEY DEFAULT 'khush-fund',
  balance NUMERIC NOT NULL DEFAULT 0,
  goal NUMERIC NOT NULL DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REFERRAL & COIN LEDGER TABLES
CREATE TABLE IF NOT EXISTS public.referral_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id),
  ambassador_id UUID REFERENCES public.users(id),
  ambassador_email TEXT,
  ambassador_college TEXT,
  referral_code TEXT NOT NULL,
  shirt_count INTEGER NOT NULL DEFAULT 0,
  order_subtotal NUMERIC NOT NULL DEFAULT 0,
  amount_added_to_vault NUMERIC NOT NULL DEFAULT 0,
  coins_earned_by_ambassador INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coin_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  order_id UUID,
  referral_code TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to vault" ON public.vault FOR SELECT USING (true);
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public newsletter subscribe" ON public.newsletter FOR INSERT WITH CHECK (true);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Grip Master'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'user',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
