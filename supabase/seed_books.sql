-- Clear existing books (optional, or just update)
-- DELETE FROM public.books;

-- Insert/Update books from consolidated_stock_and_price.csv
-- Note: UUIDs will be generated if not existing. Subject + Class + Variant/Medium is the unique key.

INSERT INTO public.books (subject_name, class_number, medium, stock_total, stock_sold, price, cost_price)
VALUES 
-- STD 10
('Adisthana Padavali', '10', 'Shared', 430, 0, 20, 20),
('Arabic', '10', 'Shared', 240, 0, 24, 24),
('Art Education', '10', 'Malayalam', 100, 0, 25, 25),
('Biology', '10', 'English', 260, 0, 21, 21),
('Biology', '10', 'Malayalam', 180, 0, 21, 21),
('Chemistry', '10', 'English', 260, 0, 20, 20),
('Chemistry', '10', 'Malayalam', 180, 0, 20, 20),
('English', '10', 'Shared', 430, 0, 24, 24),
('Hindi', '10', 'Shared', 430, 0, 21, 21),
('Information Technology (IT)', '10', 'English', 260, 0, 24, 24),
('Information Technology (IT)', '10', 'Malayalam', 180, 0, 24, 24),
('Kerala Padavali', '10', 'Shared', 130, 0, 15, 15),
('Mathematics', '10', 'English', 260, 0, 29, 29),
('Mathematics', '10', 'Malayalam', 180, 0, 29, 29),
('Physical Education', '10', 'Malayalam', 100, 0, 19, 19),
('Physics', '10', 'English', 260, 0, 18, 18),
('Physics', '10', 'Malayalam', 180, 0, 18, 18),
('Sanskrit', '10', 'Shared', 30, 0, 20, 20),
('Social Science 1', '10', 'English', 260, 0, 21, 21),
('Social Science 1', '10', 'Malayalam', 180, 0, 21, 21),
('Social Science 2', '10', 'English', 260, 0, 25, 25),
('Social Science 2', '10', 'Malayalam', 180, 0, 25, 25),
('Urdu', '10', 'Shared', 15, 0, 21, 21),
('Work Education (Agriculture)', '10', 'Malayalam', 20, 0, 13, 13),
('Work Education (Clothing)', '10', 'Malayalam', 20, 0, 14, 14),
('Work Education (Printing)', '10', 'Malayalam', 20, 0, 14, 14),

-- STD 9
('Adisthana Padavali', '9', 'Shared', 410, 0, 15, 15),
('Arabic', '9', 'Shared', 210, 0, 20, 20),
('Art Education', '9', 'English', 150, 0, 20, 20),
('Biology', '9', 'English', 250, 0, 15, 15),
('Biology', '9', 'Malayalam', 170, 0, 15, 15),
('Chemistry', '9', 'English', 250, 0, 18, 18),
('Chemistry', '9', 'Malayalam', 170, 0, 18, 18),
('English', '9', 'Shared', 410, 0, 22, 22),
('Hindi', '9', 'Shared', 410, 0, 25, 25),
('Information Technology (IT)', '9', 'English', 250, 0, 18, 18),
('Information Technology (IT)', '9', 'Malayalam', 170, 0, 18, 18),
('Kerala Padavali', '9', 'Shared', 120, 0, 16, 16),
('Mathematics', '9', 'English', 250, 0, 27, 27),
('Mathematics', '9', 'Malayalam', 170, 0, 27, 27),
('Physical Education', '9', 'English', 150, 0, 15, 15),
('Physics', '9', 'English', 250, 0, 20, 20),
('Physics', '9', 'Malayalam', 170, 0, 20, 20),
('Sanskrit', '9', 'Shared', 50, 0, 19, 19),
('Social Science 1', '9', 'English', 250, 0, 18, 18),
('Social Science 1', '9', 'Malayalam', 170, 0, 18, 18),
('Social Science 2', '9', 'English', 250, 0, 19, 19),
('Social Science 2', '9', 'Malayalam', 170, 0, 19, 19),
('Urdu', '9', 'Shared', 40, 0, 17, 17),
('Work Education', '9', 'English', 150, 0, 16, 16)

ON CONFLICT (subject_name, class_number, medium) 
DO UPDATE SET 
    stock_total = EXCLUDED.stock_total,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price;
