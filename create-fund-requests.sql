-- Create fund_requests table with the exact requested columns
CREATE TABLE IF NOT EXISTS public.fund_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username text,
  email text,
  panel_name text,
  plan_name text,
  amount numeric NOT NULL,
  utr_number text NOT NULL,
  payment_screenshot text, -- Nullable URL/path to the screenshot
  status text DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Verified', 'Rejected'
  admin_note text, -- Nullable admin feedback
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can insert their own fund_requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Users can view their own fund_requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Admin can view all fund_requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Admin can update all fund_requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Enable all access for authenticated users on fund_requests" ON public.fund_requests;

-- 1. Users can insert only their own payment requests
CREATE POLICY "Users can insert their own fund_requests" ON public.fund_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Users can view only their own payment requests
CREATE POLICY "Users can view their own fund_requests" ON public.fund_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'dev7287132@gmail.com' OR auth.jwt() ->> 'email' = 'dev728132@gmail.com');

-- 3. Admin can view all payment requests (via dev7287132@gmail.com or other checks)
CREATE POLICY "Admin can view all fund_requests" ON public.fund_requests
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'dev7287132@gmail.com' OR auth.jwt() ->> 'email' = 'dev728132@gmail.com');

-- 4. Admin can update all payment requests
CREATE POLICY "Admin can update all fund_requests" ON public.fund_requests
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'dev7287132@gmail.com' OR auth.jwt() ->> 'email' = 'dev728132@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'dev7287132@gmail.com' OR auth.jwt() ->> 'email' = 'dev728132@gmail.com');

-- 5. Admin can delete if needed (optional, just in case)
CREATE POLICY "Admin can delete fund_requests" ON public.fund_requests
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'dev7287132@gmail.com' OR auth.jwt() ->> 'email' = 'dev728132@gmail.com');

-- Add product_key column to orders table for product key delivery
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_key text;

