'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingCart, User, Landmark, IndianRupee, Loader2, AlertCircle, Plus, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { generateReceipt } from '@/utils/receiptGenerator';
import { useAuth } from './AuthContext';

interface Book {
  id: string;
  subject_name: string;
  stock_total: number;
  stock_sold: number;
  price: number;
}

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSuccess: () => void;
}

export default function DistributionModal({ isOpen, onClose, books, onSuccess }: DistributionModalProps) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [division, setDivision] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Filter books to only those with stock
  const availableBooks = useMemo(() => {
    return books.filter(b => (b.stock_total - b.stock_sold) > 0);
  }, [books]);

  const updateCart = (bookId: string, delta: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const currentQty = cart[bookId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    const available = book.stock_total - book.stock_sold;

    if (newQty > available) {
      toast.error(`Only ${available} units of ${book.subject_name} available.`);
      return;
    }

    if (newQty === 0) {
      const newCart = { ...cart };
      delete newCart[bookId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [bookId]: newQty });
    }
  };

  const totalAmount = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const book = books.find(b => b.id === id);
      return sum + (book?.price || 0) * qty;
    }, 0);
  }, [cart, books]);

  const handleConfirm = async () => {
    if (!studentName || !division) {
      toast.error('Please enter student name and division');
      return;
    }
    if (Object.keys(cart).length === 0) {
      toast.error('Please select at least one textbook');
      return;
    }

    setLoading(true);
    try {
      const saleItems = Object.entries(cart).map(([id, qty]) => {
        const book = books.find(b => b.id === id)!;
        return {
          book_id: id,
          subject_name: book.subject_name,
          quantity: qty,
          price: book.price,
          subtotal: qty * book.price
        };
      });

      // 1. Call the Bulk Sale RPC
      const { error } = await supabase.rpc('record_bulk_sale', {
        p_student_name: studentName,
        p_division: division,
        p_items: saleItems,
        p_total_amount: totalAmount,
        p_staff_name: user || 'Staff'
      });

      if (error) throw error;

      // 2. Generate Receipt
      generateReceipt(studentName, division, saleItems, totalAmount, user || 'Staff');

      toast.success('Distribution recorded and bill generated!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(`Transaction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudentName('');
    setDivision('');
    setCart({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 bg-primary text-white flex justify-between items-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">New Distribution</h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Select textbooks & Generate Bill</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Student Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl border border-primary/5 focus:border-primary/20 focus:outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Division</label>
                  <div className="relative group max-w-[120px] mx-auto">
                    <Landmark size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="10 C"
                      className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl border border-primary/5 focus:border-primary/20 focus:outline-none transition-all font-black text-center uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Textbook Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Select Textbooks</label>
                <div className="grid gap-3">
                  {availableBooks.length > 0 ? (
                    availableBooks.map((book) => (
                      <div 
                        key={book.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          cart[book.id] ? 'bg-primary/5 border-primary/20' : 'bg-secondary/50 border-transparent hover:border-primary/10'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-bold text-foreground leading-tight">{book.subject_name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase">₹{book.price} per unit • <span className="text-emerald-600/60">{book.stock_total - book.stock_sold} Left</span></p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/50 p-1 rounded-xl shadow-inner">
                          <button 
                            onClick={() => updateCart(book.id, -1)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-black text-lg">{cart[book.id] || 0}</span>
                          <button 
                            onClick={() => updateCart(book.id, 1)}
                            className="p-2 hover:bg-emerald-50 text-emerald-500 rounded-lg transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-secondary/30 rounded-3xl border border-dashed border-primary/10">
                      <AlertCircle size={32} className="mx-auto text-primary/20 mb-2" />
                      <p className="text-foreground/40 font-bold">No textbooks available in stock.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Total and Confirm */}
            <div className="p-8 bg-secondary/80 backdrop-blur-md border-t border-primary/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 block mb-1">Total Bill Amount</span>
                <div className="flex items-center gap-1">
                  <IndianRupee size={20} className="text-primary" />
                  <span className="text-3xl font-black text-foreground">{totalAmount.toFixed(1)}</span>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                disabled={loading || totalAmount === 0}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Confirm & Print Bill
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
