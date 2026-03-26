'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ finishLoading }: { finishLoading: () => void }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timeout = setTimeout(() => {
      finishLoading();
    }, 1800); // Faster loading for better UX

    return () => clearTimeout(timeout);
  }, [finishLoading]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[800px] h-[800px] bg-primary rounded-full blur-[120px]"
      />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Logo (SVG Draw-in) */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-8"
        >
          <motion.path
            d="M20 20H80V80H20V20Z"
            stroke="#D4AF37"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M30 40H70M30 50H70M30 60H50"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
          />
        </svg>

        {/* Brand Text Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold font-outfit tracking-tighter text-foreground mb-1">
            PTM <span className="text-primary">HSS</span>
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
          />
          <p className="mt-4 text-xs font-medium tracking-[0.3em] uppercase text-foreground/40">
            Textbooks Management
          </p>
        </motion.div>
      </div>
      
      {/* Bottom accent */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="absolute bottom-12 left-0 right-0 flex justify-center"
      >
        <div className="w-1 h-12 bg-gradient-to-b from-gold/40 to-transparent rounded-full" />
      </motion.div>
    </div>
  );
}
