-- Seed cow products for Goshala website
INSERT INTO public.products (name, description, price, mrp, quantity_available, stock_status, display_order) VALUES
('Gomaya (Cow Dung Cakes)', 'Pure dried cow dung cakes for use in pooja, rituals, and agriculture. 100% natural and organic.', 50.00, 60.00, 150, 'in_stock', 1),
('Pure Desi Ghee', 'Traditional A2 ghee made from Malenadu Gidda cow milk. Rich, aromatic, and pure. 500ml jar.', 450.00, 500.00, 45, 'low_stock', 2),
('Fresh Cow Milk', 'Fresh, unpasteurized A2 cow milk from our healthy herd. Perfect for family and daily use. 1 Liter.', 60.00, 70.00, 80, 'in_stock', 3),
('Homemade Curd', 'Thick, creamy traditional curd made from fresh desi cow milk. 500g.', 40.00, 50.00, 60, 'in_stock', 4),
('Cow Butter', 'Handmade butter from fresh cream of A2 milk. Rich in nutrients. 200g.', 180.00, 200.00, 35, 'low_stock', 5),
('Cow Urine (Gomutra)', 'Sterile, processed cow urine from healthy cows. Used in traditional Ayurvedic practices. 500ml.', 120.00, 150.00, 25, 'low_stock', 6),
('Paneer (Cow Milk)', 'Fresh paneer made from pure desi cow milk. Soft and delicious. 250g.', 200.00, 250.00, 40, 'in_stock', 7),
('Cow Dung Incense', 'Natural incense sticks made with pure cow dung. Used in rituals and meditation. 50 sticks.', 80.00, 100.00, 90, 'in_stock', 8),
('Whey Powder', 'Nutritious whey powder derived from cow milk. Great for protein supplementation. 500g.', 280.00, 320.00, 55, 'in_stock', 9),
('Desi Cow Milk Powder', 'Pure milk powder made from fresh Malenadu Gidda cow milk. No additives. 250g.', 220.00, 260.00, 50, 'low_stock', 10);

-- Update stock status based on quantities
SELECT public.sync_stock_status();
