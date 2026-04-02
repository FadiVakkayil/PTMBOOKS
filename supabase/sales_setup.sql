-- SALES HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    division TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB NOT NULL, -- [{book_id, subject_name, quantity, price, subtotal}]
    staff_name TEXT DEFAULT 'Staff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access" ON public.sales;
CREATE POLICY "Allow public all access" ON public.sales FOR ALL USING (true) WITH CHECK (true);

-- BULK SALE RPC
CREATE OR REPLACE FUNCTION record_bulk_sale(
    p_student_name TEXT,
    p_division TEXT,
    p_items JSONB,
    p_total_amount DECIMAL,
    p_staff_name TEXT
) RETURNS VOID AS $$
DECLARE
    item JSONB;
BEGIN
    -- 1. Insert the master sale record
    INSERT INTO public.sales (student_name, division, total_amount, items, staff_name)
    VALUES (p_student_name, p_division, p_total_amount, p_items, p_staff_name);

    -- 2. Loop through items and update book stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Update books table
        UPDATE public.books 
        SET stock_sold = stock_sold + (item->>'quantity')::INT
        WHERE id = (item->>'book_id')::UUID;
        
        -- Add to activity_logs for undo support
        INSERT INTO public.activity_logs (book_id, subject_name, action_type, amount, metadata)
        VALUES (
            (item->>'book_id')::UUID, 
            (item->>'subject_name'), 
            'SALE_RECORD', 
            (item->>'quantity')::INT,
            jsonb_build_object('student', p_student_name, 'division', p_division)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
