'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 glass h-20"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
          <img 
            src="/assets/LOGO_withoutbg.png" 
            alt="PTM HSS" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter font-outfit text-foreground leading-none">
            PTM <span className="text-primary">HSS</span>
          </span>
          <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-0.5">Thrikkadeeri</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-foreground/80">{user}</span>
              <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Authorized Staff</span>
            </div>
            <div className="w-[1px] h-8 bg-foreground/10 hidden md:block" />
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all group"
            >
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
