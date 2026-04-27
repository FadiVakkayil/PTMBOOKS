'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Check, X, TrendingUp, Package, Loader2, IndianRupee, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Book {
  id: string;
  subject_name: string;
  stock_total: number;
  stock_sold: number;
  price: number;
  cost_price: number;
}

interface TextbookCardProps {
  book: Book;
  onUpdate: () => void;
}

export default function TextbookCard({ book, onUpdate }: TextbookCardProps) {
  const [isEditingData, setIsEditingData] = useState(false);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isEditingRemaining, setIsEditingRemaining] = useState(false);
  
  const [tempPrice, setTempPrice] = useState(book.price.toString());
  const [tempCost, setTempCost] = useState((book.cost_price || 0).toString());
  const [stockAmount, setStockAmount] = useState('1');
  const [remainingAmount, setRemainingAmount] = useState(book.stock_total - book.stock_sold);
  const [loading, setLoading] = useState(false);

  const currentStock = book.stock_total - book.stock_sold;
  
  const totalArrivedValue = book.stock_total * (book.cost_price || 0);
  const totalDistributedValue = book.stock_sold * book.price;
  const netMargin = totalDistributedValue - totalArrivedValue;

  const handleSaveFinancials = async () => {
    const newPrice = parseFloat(tempPrice);
    const newCost = parseFloat(tempCost);

    if (isNaN(newPrice) || isNaN(newCost)) {
      toast.error('Please enter valid numbers for price and cost');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_financials', { 
        row_id: book.id, 
        new_price: newPrice, 
        new_cost: newCost 
      });

      if (error) throw error;
      toast.success('Financials updated successfully!');
      onUpdate();
      setIsEditingData(false);
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    const amount = parseInt(stockAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('increment_stock', { 
        row_id: book.id, 
        amount: amount 
      });
      if (error) throw error;
      
      toast.success(`${amount} units added to stock!`);
      setIsAddingStock(false);
      setStockAmount('1');
      onUpdate();
    } catch (error: any) {
      toast.error(`Stock update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustRemaining = async () => {
    const amount = parseInt(remainingAmount.toString());
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('adjust_remaining_stock', { 
        p_row_id: book.id, 
        p_target_remaining: amount 
      });
      if (error) throw error;
      
      toast.success(`Remaining stock adjusted to ${amount}!`);
      setIsEditingRemaining(false);
      onUpdate();
    } catch (error: any) {
      toast.error(`Adjustment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15), 0 0 20px rgba(212, 175, 55, 0.1)" }}
      className="bg-white rounded-3xl p-6 pb-8 border border-primary/5 shadow-xl transition-all relative group h-full flex flex-col"
    >
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors mb-1 pr-6 leading-tight">
              {book.subject_name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">ID: {book.id.split('-')[0]}</span>
              {currentStock <= 5 && (
                <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                  <AlertTriangle size={10} /> Low Stock
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditingData(!isEditingData)}
            className={`p-2 rounded-xl transition-all ${isEditingData ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
          >
            <Edit2 size={16} />
          </button>
        </div>

        {/* Stock Status Badge - Most Prominent */}
        <div className={`mb-6 p-4 rounded-2xl flex flex-col items-center justify-center border transition-all relative ${
          currentStock > 20 ? 'bg-emerald-50 border-emerald-100' : 
          currentStock > 0 ? 'bg-amber-50 border-amber-100' : 
          'bg-red-50 border-red-100'
        }`}>
          <button 
            onClick={() => {
              setRemainingAmount(currentStock);
              setIsEditingRemaining(!isEditingRemaining);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/50 text-foreground/40 hover:text-primary transition-colors"
          >
            <Edit2 size={12} />
          </button>

          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
             currentStock > 20 ? 'text-emerald-500' : 
             currentStock > 0 ? 'text-amber-500' : 
             'text-red-500'
          }`}>Remaining Stock</span>
          
          <AnimatePresence mode="wait">
            {isEditingRemaining ? (
              <motion.div 
                key="edit-rem"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(parseInt(e.target.value) || 0)}
                  className="w-20 bg-white border border-primary/10 px-2 py-1 rounded-lg text-xl font-black text-center"
                  autoFocus
                />
                <button 
                  onClick={handleAdjustRemaining}
                  className="p-1.5 bg-primary text-white rounded-lg"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => setIsEditingRemaining(false)}
                  className="p-1.5 bg-red-500 text-white rounded-lg"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.p 
                key="view-rem"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-4xl font-black ${
                  currentStock > 20 ? 'text-emerald-700' : 
                  currentStock > 0 ? 'text-amber-700' : 
                  'text-red-700'
                }`}
              >
                {currentStock}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Arrival/Distribution Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-secondary/40 p-3 rounded-xl border border-primary/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Package size={12} className="text-primary/40" />
              <span className="text-[9px] font-bold uppercase text-foreground/30">Arrived</span>
            </div>
            <p className="text-lg font-black text-foreground/80">{book.stock_total}</p>
          </div>
          <div className="bg-secondary/40 p-3 rounded-xl border border-gold/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-gold/40" />
              <span className="text-[9px] font-bold uppercase text-foreground/30">Issued</span>
            </div>
            <p className="text-lg font-black text-foreground/80">{book.stock_sold}</p>
          </div>
        </div>

        {/* Financial Section */}
        <div className="mt-auto pt-4 border-t border-primary/5">
          <AnimatePresence mode="wait">
            {isEditingData ? (
              <motion.div 
                key="edit-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4 bg-secondary/50 p-4 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-foreground/40 uppercase mb-1 block">Unit Price</label>
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-foreground/40 uppercase mb-1 block">Unit Cost</label>
                    <input
                      type="number"
                      value={tempCost}
                      onChange={(e) => setTempCost(e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveFinancials} className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save
                  </button>
                  <button onClick={() => setIsEditingData(false)} className="p-2 bg-red-500 text-white rounded-lg"><X size={14} /></button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="view-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-1">
                  <div className="text-center flex-1 border-r border-primary/5">
                    <span className="text-[9px] font-bold text-foreground/20 uppercase block">Price</span>
                    <span className="text-lg font-black text-foreground/60">₹{book.price}</span>
                  </div>
                  <div className="text-center flex-1">
                    <span className="text-[9px] font-bold text-foreground/20 uppercase block">Cost</span>
                    <span className="text-lg font-black text-foreground/60">₹{book.cost_price || 0}</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isAddingStock ? (
                    <motion.div 
                      key="stock-input"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-2 p-1 bg-secondary rounded-xl"
                    >
                      <input
                        type="number"
                        value={stockAmount}
                        onChange={(e) => setStockAmount(e.target.value)}
                        className="w-12 bg-white px-2 py-2 rounded-lg text-xs font-bold"
                        autoFocus
                      />
                      <button onClick={handleAddStock} className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold transition-all active:scale-95">Confirm</button>
                      <button onClick={() => setIsAddingStock(false)} className="p-2 bg-red-500 text-white rounded-lg"><X size={14} /></button>
                    </motion.div>
                  ) : (
                    <motion.button 
                      key="stock-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setIsAddingStock(true)}
                      className="w-full py-3 bg-primary/5 text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                      Add Arrived Stock
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
