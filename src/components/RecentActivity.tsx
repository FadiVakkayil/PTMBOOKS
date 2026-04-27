'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { X, RotateCcw, Clock, ArrowRight, Package, TrendingUp, IndianRupee, Loader2, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  book_id: string;
  subject_name: string;
  action_type: 'STOCK_ADD' | 'SALE_RECORD' | 'PRICE_CHANGE';
  amount: number;
  old_value: number;
  new_value: number;
  is_undone: boolean;
  created_at: string;
}

export default function RecentActivity({ isOpen, onClose, onActionUndone }: { isOpen: boolean, onClose: () => void, onActionUndone: () => void }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all activity history? This cannot be undone.')) return;
    
    setClearing(true);
    try {
      const { error } = await supabase.rpc('clear_activity_log');
      if (error) throw error;
      
      toast.success('Activity history cleared');
      fetchLogs();
    } catch (error: any) {
      toast.error(`Clear failed: ${error.message}`);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen]);

  const handleUndo = async (logId: string) => {
    setUndoingId(logId);
    try {
      const { error } = await supabase.rpc('undo_action', { p_log_id: logId });
      if (error) throw error;
      
      toast.success('Action undone successfully');
      fetchLogs();
      onActionUndone();
    } catch (error: any) {
      toast.error(`Undo failed: ${error.message}`);
    } finally {
      setUndoingId(null);
    }
  };

  const getActionDetails = (log: ActivityLog) => {
    switch (log.action_type) {
      case 'STOCK_ADD':
        return {
          icon: Package,
          color: 'text-primary',
          bg: 'bg-primary/10',
          text: `Added ${log.amount} units to stock`
        };
      case 'SALE_RECORD':
        return {
          icon: TrendingUp,
          color: 'text-gold',
          bg: 'bg-gold/10',
          text: `Recorded sale of ${log.amount} units`
        };
      case 'PRICE_CHANGE':
        return {
          icon: IndianRupee,
          color: 'text-blue-500',
          bg: 'bg-blue-50/50',
          text: `Changed price from ₹${log.old_value} to ₹${log.new_value}`
        };
      case 'STOCK_ADJUSTMENT':
        return {
          icon: Edit2,
          color: 'text-amber-500',
          bg: 'bg-amber-50/50',
          text: `Manually adjusted remaining stock to ${log.amount}`
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-100',
          text: 'Unknown action'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-outfit">Recent Activity</h2>
                  <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Stock & Sales History</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/20">
                  <Loader2 size={40} className="animate-spin" />
                  <p className="font-bold uppercase tracking-widest text-xs">Loading History...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/20 italic">
                  <p>No recent activity found</p>
                </div>
              ) : (
                logs.map((log) => {
                  const details = getActionDetails(log);
                  const Icon = details.icon;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border ${log.is_undone ? 'opacity-50 grayscale bg-gray-50 border-gray-200' : 'bg-white border-gray-100 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${details.bg} ${details.color}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{log.subject_name}</h4>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {!log.is_undone && (
                          <button
                            onClick={() => handleUndo(log.id)}
                            disabled={undoingId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            {undoingId === log.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            Undo
                          </button>
                        )}
                        {log.is_undone && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Undone</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                        {details.text}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
              <button
                onClick={handleClearHistory}
                disabled={clearing || logs.length === 0}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 group"
              >
                {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="group-hover:scale-110 transition-transform" />}
                Clear All History
              </button>
              <p className="text-[10px] text-center text-foreground/40 font-bold uppercase tracking-widest">
                Showing last 20 actions
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
