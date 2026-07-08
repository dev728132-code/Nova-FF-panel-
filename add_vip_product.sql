-- Check if the product already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.elite_growth_products WHERE name = 'SAN GROW VIP METHODS') THEN
        INSERT INTO public.elite_growth_products (name, price, description, image_url, features, is_active)
        VALUES (
            'SAN GROW VIP METHODS', 
            600, 
            'Unlock the Ultimate Premium Digital Growth Collection featuring AI Tools, Automation Resources, Exclusive Methods, Growth Strategies, and Lifetime Updates.', 
            'https://images.unsplash.com/photo-1614064641913-6b71f3016345?w=800&q=80',
            ARRAY['Lifetime Access', 'Premium AI Tools', 'Automation Resources', 'Exclusive Digital Growth Methods', 'Regular New Updates', 'VIP Members-Only Resources', 'Save Thousands on Premium Subscriptions', 'Instant Access After Payment', 'Beginner & Advanced Friendly', 'High-Quality Digital Resources'],
            true
        );
    END IF;
END $$;
