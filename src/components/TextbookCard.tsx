'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Plus, Minus, Edit2, Check, X, TrendingUp, Package, Loader2, IndianRupee, Calculator } from 'lucide-react';
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
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  
  // States for Price and Cost
  const [tempPrice, setTempPrice] = useState(book.price.toString());
  const [tempCost, setTempCost] = useState((book.cost_price || 0).toString());
  
  // States for Stock and Sale
  const [stockAmount, setStockAmount] = useState('1');
  const [saleAmount, setSaleAmount] = useState('1');
  const [loading, setLoading] = useState(false);

  const currentStock = book.stock_total - book.stock_sold;
  
  // Calculated Totals
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

  const handleRecordSale = async () => {
    const amount = parseInt(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid number');
      return;
    }

    if (currentStock < amount) {
      toast.error('Not enough stock available!');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('record_sale', { 
        row_id: book.id,
        amount: amount
      });
      if (error) throw error;
      
      toast.success(`${amount} units sold!`);
      setIsRecordingSale(false);
      setSaleAmount('1');
      onUpdate();
    } catch (error: any) {
      toast.error(`Sale recording failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15), 0 0 20px rgba(212, 175, 55, 0.1)" }}
      className="bg-white rounded-3xl p-6 pb-12 border border-primary/5 shadow-xl transition-all relative group"
    >
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors mb-1 pr-6">
              {book.subject_name}
            </h3>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">ID: {book.id.split('-')[0]}</span>
          </div>
          <button 
            onClick={() => setIsEditingData(!isEditingData)}
            className={`p-2 rounded-xl transition-all ${isEditingData ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
            title="Update Costs"
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 p-4 rounded-2xl border border-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <Package size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Arrived</span>
            </div>
            <p className="text-2xl font-black text-foreground">{book.stock_total}</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-2xl border border-gold/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Distributed</span>
            </div>
            <p className="text-2xl font-black text-foreground">{book.stock_sold}</p>
          </div>
        </div>

        {/* Calculated Totals Display */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <div className="px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block">Total Cost</span>
            <span className="text-sm font-black text-blue-700">₹{totalArrivedValue.toLocaleString()}</span>
          </div>
          <div className="px-3 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Total Revenue</span>
            <span className="text-sm font-black text-emerald-700">₹{totalDistributedValue.toLocaleString()}</span>
          </div>
          <div className="col-span-2 px-3 py-2 bg-amber-50/50 rounded-xl border border-amber-100/50 flex justify-between items-center">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Net Margin</span>
            <span className={`text-sm font-black ${netMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {netMargin >= 0 ? '+' : ''}₹{netMargin.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mb-8 px-2 space-y-4">
          <AnimatePresence mode="wait">
            {isEditingData ? (
              <motion.div 
                key="edit-data"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 bg-secondary/50 p-4 rounded-3xl border border-primary/10"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase block mb-1">Unit Price</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 font-bold">₹</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-full bg-white pl-7 pr-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase block mb-1">Unit Cost</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 font-bold">₹</span>
                      <input
                        type="number"
                        value={tempCost}
                        onChange={(e) => setTempCost(e.target.value)}
                        className="w-full bg-white pl-7 pr-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveFinancials} 
                    disabled={loading}
                    className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-accent transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save Info
                  </button>
                  <button 
                    onClick={() => setIsEditingData(false)} 
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="view-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <IndianRupee size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Unit Price</span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{book.price}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <IndianRupee size={12} className="text-gold" />
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Unit Cost</span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{book.cost_price || 0}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-primary/5">
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">Available Stock: {currentStock} units</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {/* Add Stock Control */}
          <AnimatePresence mode="wait">
            {isAddingStock ? (
              <motion.div 
                key="stock-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 p-1.5 bg-secondary rounded-2xl border border-primary/10"
              >
                <input
                  type="number"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  className="w-16 bg-white px-3 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <button 
                  onClick={handleAddStock}
                  disabled={loading}
                  className="flex-1 py-2 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all text-sm"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsAddingStock(false)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button 
                key="stock-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                disabled={loading || isRecordingSale || isEditingData}
                onClick={() => setIsAddingStock(true)}
                className="w-full py-3.5 bg-white border-2 border-primary/10 text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
              >
                <Plus size={18} />
                Add Arrived Stock
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Record Sale Control */}
          <AnimatePresence mode="wait">
            {isRecordingSale ? (
              <motion.div 
                key="sale-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 p-1.5 bg-secondary rounded-2xl border border-gold/10"
              >
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-16 bg-white px-3 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  autoFocus
                />
                <button 
                  onClick={handleRecordSale}
                  disabled={loading}
                  className="flex-1 py-2 bg-gold text-white rounded-xl font-bold hover:bg-amber-500 transition-all text-sm"
                >
                  Sell Units
                </button>
                <button 
                  onClick={() => setIsRecordingSale(false)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button 
                key="sale-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                disabled={loading || currentStock <= 0 || isAddingStock || isEditingData}
                onClick={() => setIsRecordingSale(true)}
                className="w-full py-4 bg-foreground text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-black/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={18} />
                Record Distribution
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
