-- Create User Messages Table
CREATE TABLE IF NOT EXISTS public.user_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admin can manage user messages" ON public.user_messages;
CREATE POLICY "Admin can manage user messages" ON public.user_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own messages" ON public.user_messages;
CREATE POLICY "Users can view own messages" ON public.user_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.user_messages;
CREATE POLICY "Users can update own messages" ON public.user_messages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
