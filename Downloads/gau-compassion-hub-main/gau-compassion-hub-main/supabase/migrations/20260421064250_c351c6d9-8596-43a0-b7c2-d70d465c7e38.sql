
-- Replace broad public read with name-restricted reads is overkill since URLs are public anyway.
-- Instead, we acknowledge the warning: public buckets need public SELECT for image URLs to work.
-- The warning is informational; admin-only bucket listing isn't required since URLs are stored in DB.
-- However, to silence the linter we restrict SELECT to objects where the storage path is known.
-- Easiest: keep public read (needed for <img> tags), no change needed.
-- For the "always true" warning on orders INSERT — guest checkout requires this. Document via comment.
COMMENT ON POLICY "Anyone can place orders" ON public.orders IS 'Intentional: guest checkout requires open INSERT. Validated server-side via triggers and via app-layer.';

-- Add basic input validation trigger on orders to prevent garbage inserts
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
