-- 1. Add missing customer name and email columns to public.orders if they don't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;

-- 2. Configure Row Level Security (RLS) for public.orders to allow instant operations
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can view own orders." ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders." ON public.orders;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.orders;

-- Create policy allowing authenticated users (including the admin and customers) to perform all actions
CREATE POLICY "Enable all access for authenticated users" ON public.orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
