'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthContext';
import { BookOpen, User, Lock, Loader2, AlertCircle } from 'lucide-react';

const SHARED_PASSWORD = 'ptm@books#2026';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (password === SHARED_PASSWORD) {
        login();
      } else {
        setError('Incorrect security password. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations - Fluid & Responsive */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[100px] -mr-[20vw] -mt-[20vw]" />
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-accent/10 rounded-full blur-[100px] -ml-[20vw] -mb-[20vw]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-primary/5">
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20"
            >
              <Lock size={40} />
            </motion.div>
            <h1 className="text-3xl font-black font-outfit text-foreground tracking-tight mb-2">PTM HSS Dashboard</h1>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Secure Staff Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3 text-center">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest block">Enter Portal Password</label>
              <div className="relative group max-w-xs mx-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-center tracking-widest text-lg"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle size={20} />
                <p>{error}</p>
              </motion.div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Accessing...
                </>
              ) : (
                'Unlock Portal'
              )}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-gray-100">
            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
              AUTHORIZED SCHOOL PERSONNEL ONLY
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
