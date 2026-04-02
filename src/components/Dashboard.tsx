'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, Download, AlertCircle, Clock, FileText, Undo2, Redo2, Plus } from 'lucide-react';
import TextbookCard from './TextbookCard';
import { generateReport } from '@/utils/reportGenerator';
import RecentActivity from './RecentActivity';
import { toast } from 'sonner';
import DistributionModal from './DistributionModal';
import { generateSalesLedger } from '@/utils/salesLedgerGenerator';

interface Book {
  id: string;
  subject_name: string;
  class_number: string;
  medium: string;
  stock_total: number;
  stock_sold: number;
  price: number;
  cost_price: number;
}

export default function Dashboard() {
  const [selectedClass, setSelectedClass] = useState<'9' | '10'>('9');
  const [selectedMedium, setSelectedMedium] = useState<'Malayalam' | 'English'>('Malayalam');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('class_number', selectedClass)
        .eq('medium', selectedMedium);

      if (fetchError) {
        setError(`${fetchError.message}. ${fetchError.hint || ''}`);
      } else if (data) {
        // --- DEDUPLICATION LOGIC ---
        // Group by subject_name to prevent duplicates in the UI
        const deduplicated = (data as Book[]).reduce((acc, current) => {
          const key = current.subject_name;
          if (!acc[key]) {
            acc[key] = { ...current };
          } else {
            // Merge counts
            acc[key].stock_total += current.stock_total;
            acc[key].stock_sold += current.stock_sold;
            // Use the latest price/cost (the one with the "larger" ID or later)
            if (current.id > acc[key].id) {
              acc[key].price = current.price;
              acc[key].cost_price = current.cost_price;
              acc[key].id = current.id;
            }
          }
          return acc;
        }, {} as Record<string, Book>);

        const subjectPriority: Record<string, number> = {
          'Biology': 1, 'Chemistry': 1, 'Physics': 1, 'Information Technology (IT)': 1,
          'Social Science 1': 2, 'Social Science 2': 2,
          'Maths': 3,
          'Urdu': 4, 'Malayalam 1': 4, 'കേരള പാഠാവലി': 4, 'Sanskrit': 4, 'Arabic': 4, 'Malayalam 2': 4, 'അടിസ്ഥാന പാഠാവലി': 4,
          'PHYSICAL EDUCATION': 5, 'ART EDUCATION': 5, 'WORK EDUCATION': 5
        };

        const displayMap: Record<string, string> = {
          'Malayalam 1': 'കേരള പാഠാവലി',
          'Malayalam 2': 'അടിസ്ഥാന പാഠാവലി'
        };

        const sortedData = Object.values(deduplicated).map(b => ({
          ...b,
          subject_name: displayMap[b.subject_name] || b.subject_name
        })).sort((a, b) => {
          const pA = subjectPriority[a.subject_name] || 99;
          const pB = subjectPriority[b.subject_name] || 99;
          if (pA !== pB) return pA - pB;
          return a.subject_name.localeCompare(b.subject_name);
        });

        setBooks(sortedData);
      }
    } catch (err: any) {
      setError('Failed to connect to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('books')
        .select('*');
      
      if (fetchError) throw fetchError;
      if (data) generateReport(data as Book[]);
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadLedger = async () => {
    setLedgerLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) generateSalesLedger(data);
    } catch (err: any) {
      toast.error('Failed to load sales ledger: ' + err.message);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleQuickUndo = async () => {
    try {
      const { data: latestLog, error: logError } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('is_undone', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (logError || !latestLog) {
        toast.info('Nothing to undo');
        return;
      }

      const { error } = await supabase.rpc('undo_action', { p_log_id: latestLog.id });
      if (error) throw error;
      
      toast.success('Undone last action');
      fetchBooks();
    } catch (err: any) {
      toast.error('Undo failed: ' + err.message);
    }
  };

  const handleQuickRedo = async () => {
    try {
      const { data: latestLog, error: logError } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('is_undone', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (logError || !latestLog) {
        toast.info('Nothing to redo');
        return;
      }

      const { error } = await supabase.rpc('redo_action', { p_log_id: latestLog.id });
      if (error) throw error;
      
      toast.success('Redone last action');
      fetchBooks();
    } catch (err: any) {
      toast.error('Redo failed: ' + err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedClass, selectedMedium]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="dashboard" className="py-20 bg-secondary min-h-screen">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center mb-16">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="hidden md:flex flex-1 items-center gap-4">
              <div className="flex items-center bg-white rounded-xl border border-primary/10 p-1 shadow-sm">
                <button 
                  onClick={handleQuickUndo}
                  className="p-2 hover:bg-secondary rounded-lg text-foreground/40 hover:text-primary transition-colors"
                  title="Undo"
                >
                  <Undo2 size={20} />
                </button>
                <div className="w-[1px] h-6 bg-primary/10 mx-1" />
                <button 
                  onClick={handleQuickRedo}
                  className="p-2 hover:bg-secondary rounded-lg text-foreground/40 hover:text-gold transition-colors"
                  title="Redo"
                >
                  <Redo2 size={20} />
                </button>
              </div>
            </div>
            <h2 className="text-4xl font-bold font-outfit text-center flex-1 text-primary">Textbook Inventory</h2>
            <div className="w-full md:w-auto flex justify-center md:justify-end flex-1 gap-3">
              <button 
                onClick={handleDownloadLedger}
                disabled={ledgerLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10 disabled:opacity-50"
              >
                {ledgerLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Sales Ledger
              </button>
              <button 
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-bold hover:bg-primary hover:text-white border border-primary/20 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {reportLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Audit Report
              </button>
              <button 
                onClick={() => setIsDistributionOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <Plus size={18} />
                New Distribution
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Class Toggle */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10 flex relative overflow-hidden">
              <motion.div
                className="absolute top-1.5 bottom-1.5 bg-primary rounded-xl"
                initial={false}
                animate={{
                  x: selectedClass === '9' ? 0 : '100%',
                  width: 'calc(50% - 3px)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setSelectedClass('9')}
                className={`relative px-8 py-2.5 text-sm font-bold z-10 transition-colors ${selectedClass === '9' ? 'text-white' : 'text-foreground/60 hover:text-foreground'}`}
              >
                9th Class
              </button>
              <button
                onClick={() => setSelectedClass('10')}
                className={`relative px-8 py-2.5 text-sm font-bold z-10 transition-colors ${selectedClass === '10' ? 'text-white' : 'text-foreground/60 hover:text-foreground'}`}
              >
                10th Class
              </button>
            </div>

            {/* Medium Toggle */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10 flex relative overflow-hidden">
              <motion.div
                className="absolute top-1.5 bottom-1.5 bg-gold rounded-xl"
                initial={false}
                animate={{
                  x: selectedMedium === 'Malayalam' ? 0 : '100%',
                  width: 'calc(50% - 3px)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setSelectedMedium('Malayalam')}
                className={`relative px-8 py-2.5 text-sm font-bold z-10 transition-colors ${selectedMedium === 'Malayalam' ? 'text-white' : 'text-foreground/60 hover:text-foreground'}`}
              >
                Malayalam
              </button>
              <button
                onClick={() => setSelectedMedium('English')}
                className={`relative px-8 py-2.5 text-sm font-bold z-10 transition-colors ${selectedMedium === 'English' ? 'text-white' : 'text-foreground/60 hover:text-foreground'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto bg-red-50 border border-red-200 p-8 rounded-3xl text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Connection Error</h3>
                <p className="text-red-700 text-sm mb-6">{error}</p>
                <button 
                  onClick={fetchBooks}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedClass}-${selectedMedium}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {books.length > 0 ? (
                  books.map((book) => (
                    <motion.div key={book.id} variants={itemVariants}>
                      <TextbookCard book={book} onUpdate={fetchBooks} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-foreground/40 font-medium">No books found for this selection.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RecentActivity 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onActionUndone={fetchBooks}
      />
      <DistributionModal 
        isOpen={isDistributionOpen}
        onClose={() => setIsDistributionOpen(false)}
        books={books}
        onSuccess={fetchBooks}
      />
    </section>
  );
}
