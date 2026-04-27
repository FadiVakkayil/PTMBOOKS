-- 1. Normalize subject names to English standards
UPDATE public.books SET subject_name = 'Adisthana Padavali' WHERE subject_name IN ('Malayalam 1', 'അടിസ്ഥാന പാഠാവലി', 'Adisthana Padavali (Mal 1)', 'Malayalam (Adisthana Padavali)');
UPDATE public.books SET subject_name = 'Kerala Padavali' WHERE subject_name IN ('Malayalam 2', 'കേരള പാഠാവലി', 'Kerala Padavali (Mal 2)', 'Malayalam (Kerala Padavali)');
UPDATE public.books SET subject_name = 'Mathematics' WHERE subject_name IN ('Maths', 'Math', 'Mathematics (Eng)', 'Mathematics (Mal)', 'Maths (E)', 'Maths (M)', 'Mathematics (E)', 'Mathematics (M)');
UPDATE public.books SET subject_name = 'Information Technology (IT)' WHERE subject_name IN ('I.C.T.', 'ICT', 'IT', 'Information Technology', 'I.C.T. (M)', 'I.C.T. (E)');
UPDATE public.books SET subject_name = 'Art Education' WHERE UPPER(subject_name) LIKE 'ART EDUCATION%';
UPDATE public.books SET subject_name = 'Physical Education' WHERE UPPER(subject_name) LIKE 'PHYSICAL EDUCATION%';
UPDATE public.books SET subject_name = 'Work Education' WHERE UPPER(subject_name) = 'WORK EDUCATION' AND class_number = '9';

-- 1.2 Remove the "normal" Work Education for Class 10 (keep only the variants)
DELETE FROM public.books 
WHERE (subject_name = 'Work Education' OR subject_name = 'Work Education (Others)')
AND class_number = '10';

-- 0. Update the check constraint to allow 'Shared' medium
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_medium_check;
ALTER TABLE public.books ADD CONSTRAINT books_medium_check CHECK (medium IN ('Malayalam', 'English', 'Shared', 'Arabic', 'Urdu', 'Sanskrit', 'Hindi', 'Eng', 'Mal'));

-- 1.5 Update language subjects and Education subjects to 'Shared' medium
UPDATE public.books
SET medium = 'Shared'
WHERE subject_name IN ('English', 'Hindi', 'Urdu', 'Arabic', 'Sanskrit', 'Kerala Padavali', 'Adisthana Padavali', 'Art Education', 'Physical Education');

-- 2. Deduplicate the books table using a text cast for the UUID
WITH grouped_books AS (
    SELECT 
        MIN(id::text)::uuid as keep_id,
        subject_name,
        class_number,
        medium,
        SUM(stock_total) as total_stock,
        SUM(stock_sold) as total_sold
    FROM public.books
    GROUP BY subject_name, class_number, medium
)
UPDATE public.books b
SET 
    stock_total = gb.total_stock,
    stock_sold = gb.total_sold
FROM grouped_books gb
WHERE b.id = gb.keep_id;

-- 3. Delete redundant rows
DELETE FROM public.books
WHERE id NOT IN (
    SELECT MIN(id::text)::uuid
    FROM public.books
    GROUP BY subject_name, class_number, medium
);

-- 4. Add the UNIQUE constraint
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_unique_subject_class_medium;
ALTER TABLE public.books ADD CONSTRAINT books_unique_subject_class_medium UNIQUE (subject_name, class_number, medium);

-- 5. RPC to adjust remaining stock
CREATE OR REPLACE FUNCTION adjust_remaining_stock(p_row_id UUID, p_target_remaining INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.books
    SET stock_sold = stock_total - p_target_remaining
    WHERE id = p_row_id;
    
    INSERT INTO public.activity_logs (book_id, action_type, amount, metadata)
    VALUES (p_row_id, 'STOCK_ADJUSTMENT', p_target_remaining, jsonb_build_object('note', 'Manual adjustment of remaining stock'));
END;
$$ LANGUAGE plpgsql;
