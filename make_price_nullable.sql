-- Migration to make product price optional for free downloads
-- Run this in your Supabase SQL Editor:
ALTER TABLE public.digital_products ALTER COLUMN price DROP NOT NULL;
