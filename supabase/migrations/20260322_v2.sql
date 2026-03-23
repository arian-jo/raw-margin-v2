-- ============================================
-- Raw Margin V2 Migration
-- Adds: categories, accounts tables
-- Modifies: expenses (add FKs)
-- ============================================

-- Tabla categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agregar columnas FK a expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('gasto', 'ingreso')) DEFAULT 'gasto';

-- RLS para categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Función para crear categorías y cuenta por defecto al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS TRIGGER AS $$
DECLARE
  default_account_id UUID;
BEGIN
  -- Crear perfil
  INSERT INTO public.profiles (id, monthly_income, savings_goal)
  VALUES (new.id, 0, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Crear cuenta por defecto
  INSERT INTO public.accounts (id, user_id, name)
  VALUES (gen_random_uuid(), new.id, 'Personal')
  RETURNING id INTO default_account_id;

  -- Crear categorías por defecto con colores
  INSERT INTO public.categories (user_id, name, color) VALUES
    (new.id, 'Comida', '#ef4444'),
    (new.id, 'Transporte', '#f59e0b'),
    (new.id, 'Entretenimiento', '#8b5cf6'),
    (new.id, 'Salud', '#10b981'),
    (new.id, 'Educación', '#3b82f6'),
    (new.id, 'Hogar', '#ec4899'),
    (new.id, 'Ropa', '#6366f1'),
    (new.id, 'Servicios', '#14b8a6'),
    (new.id, 'Otros', '#6b7280');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar el trigger original
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_v2();
