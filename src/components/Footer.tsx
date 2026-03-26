'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-primary/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold font-outfit text-foreground capitalize">
              PTM <span className="text-primary">HSS</span> Thrikkadeeri
            </h3>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
              Official Textbook Management Portal
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-xs font-medium text-foreground/60">
              Designed and Developed by
            </p>
            <p className="text-sm font-black text-primary font-outfit tracking-tight">
              Fadi Vakkayil
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} PTM HSS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
             <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Admin Portal</span>
             <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">v2.0.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
