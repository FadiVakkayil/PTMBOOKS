'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingCart, User, Landmark, IndianRupee, Loader2, AlertCircle, Plus, Minus, Phone, School, Printer, Download, ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getReceiptBlobUrl, generateReceipt } from '@/utils/receiptGenerator';
import { useAuth } from './AuthContext';
import VirtualReceipt from './VirtualReceipt';

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
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'form' | 'receipt'>('form');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [saleItemsData, setSaleItemsData] = useState<any[]>([]);
  const [transactionDate, setTransactionDate] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Show all books, regardless of stock
  const allBooks = useMemo(() => books, [books]);

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
        p_phone: phone,
        p_school: school,
        p_items: saleItems,
        p_total_amount: totalAmount,
        p_staff_name: user || 'Staff'
      });

      if (error) throw error;

      // 2. Generate Receipt Preview
      const dateStr = new Date().toLocaleString();
      const blobUrl = getReceiptBlobUrl(studentName, division, saleItems, totalAmount, user || 'Staff', phone, school);
      
      setReceiptUrl(blobUrl);
      setSaleItemsData(saleItems);
      setTransactionDate(dateStr);
      setView('receipt');

      toast.success('Distribution recorded!');
      onSuccess();
    } catch (err: any) {
      toast.error(`Transaction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.print();
    } else if (receiptUrl) {
      // Fallback
      window.open(receiptUrl, '_blank')?.print();
    }
  };

  const handleDownload = () => {
    if (saleItemsData.length > 0) {
      generateReceipt(studentName, division, saleItemsData, totalAmount, user || 'Staff', phone, school);
    }
  };

  const handleClose = () => {
    setStudentName('');
    setDivision('');
    setPhone('');
    setSchool('');
    setCart({});
    setView('form');
    setReceiptUrl(null);
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
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">
                  {view === 'form' ? 'New Distribution' : 'Receipt Preview'}
                </h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  {view === 'form' ? 'Select textbooks & Generate Bill' : 'Confirm details & Print Bill'}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                <X size={24} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'form' ? (
                <motion.div 
                  key="form-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
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

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Phone Number</label>
                        <div className="relative group">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 00000 00000"
                            className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl border border-primary/5 focus:border-primary/20 focus:outline-none transition-all font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Customer School</label>
                        <div className="relative group">
                          <School size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            placeholder="School Name"
                            className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl border border-primary/5 focus:border-primary/20 focus:outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Textbook Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Select Textbooks</label>
                      <div className="grid gap-3">
                        {allBooks.length > 0 ? (
                          allBooks.map((book) => {
                            const available = book.stock_total - book.stock_sold;
                            const isOutOfStock = available <= 0;
                            
                            return (
                              <div 
                                key={book.id}
                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                                  cart[book.id] ? 'bg-primary/5 border-primary/20' : 'bg-secondary/50 border-transparent hover:border-primary/10'
                                } ${isOutOfStock ? 'opacity-60' : ''}`}
                              >
                                <div className="flex-1">
                                  <p className="font-bold text-foreground leading-tight">{book.subject_name}</p>
                                  <p className="text-[10px] font-bold uppercase">
                                    <span className="text-foreground/30">₹{book.price} per unit</span>
                                    <span className="mx-2 text-foreground/10 text-xs">|</span>
                                    <span className={isOutOfStock ? 'text-red-500' : 'text-emerald-600/60'}>
                                      {isOutOfStock ? 'Out of Stock' : `${available} Units Left`}
                                    </span>
                                  </p>
                                </div>
                                <div className={`flex items-center gap-4 bg-white/50 p-1 rounded-xl shadow-inner ${isOutOfStock ? 'grayscale pointer-events-none' : ''}`}>
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
                            );
                          })
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
                      Confirm Distribution
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="receipt-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ready to Print</p>
                          <h4 className="font-bold text-foreground">Official Receipt Generated</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-white border border-primary/10 rounded-full text-[10px] font-bold text-primary uppercase">A5 Format</span>
                         <span className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-bold text-white uppercase shadow-sm">Verified</span>
                      </div>
                    </div>

                    <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 flex-1 relative min-h-[400px] shadow-inner p-4 flex items-center justify-center">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md px-4 py-1 rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400">Preview Mode</div>
                      
                      {/* Hidden Iframe for Actual Printing */}
                      <iframe 
                        ref={iframeRef}
                        src={receiptUrl || ''} 
                        className="hidden"
                        title="Receipt Print Frame"
                      />

                      {saleItemsData.length > 0 ? (
                        <div className="w-full transform scale-[0.9] origin-center">
                          <VirtualReceipt 
                            studentName={studentName}
                            division={division}
                            items={saleItemsData}
                            totalAmount={totalAmount}
                            staffName={user || 'Staff'}
                            date={transactionDate}
                            phone={phone}
                            schoolName={school}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-foreground/20">
                          <Loader2 size={40} className="animate-spin mb-4" />
                          <p className="font-bold">Generating Preview...</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all active:scale-95"
                      >
                        <Printer size={18} />
                        Print Receipt
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 py-4 bg-white text-primary border border-primary/20 rounded-2xl font-bold hover:bg-primary/5 transition-all active:scale-95"
                      >
                        <Download size={18} />
                        Download PDF
                      </button>
                    </div>
                  </div>

                  <div className="p-8 bg-secondary/80 backdrop-blur-md border-t border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <Check size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-foreground/40">Success</p>
                        <p className="text-sm font-bold text-foreground">Sale Recorded Successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="px-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      New Distribution
                      <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
