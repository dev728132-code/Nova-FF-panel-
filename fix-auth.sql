-- Auto-confirm users to bypass email confirmation
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();
