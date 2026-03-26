'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-secondary min-h-screen flex items-center">
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[100px] -mr-[20vw] -mt-[20vw]" />
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-accent/10 rounded-full blur-[100px] -ml-[20vw] -mb-[20vw]" />

      <div className="container mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center md:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide uppercase rounded-full bg-primary/10 text-primary"
          >
            Official Textbook Portal
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-8 leading-[1.1]">
            PTM HSS <br /><span className="text-gradient">Thrikkadeeri</span>
          </h1>
          <p className="text-xl text-foreground/60 mb-10 leading-relaxed max-w-2xl">
            Streamlining textbook arrivals, inventory management, and distribution tracking for a more organized academic experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#dashboard" className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-accent transition-all shadow-xl shadow-primary/30 hover:shadow-2xl text-center">
              Manage Inventory
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 relative"
        >
          <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl transform -rotate-6" />
            <div className="relative bg-white p-4 rounded-3xl shadow-2xl h-full border border-primary/10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-blue-900 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]" />
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                <div className="w-32 h-32 md:w-40 md:h-40 mb-6 relative z-10">
                  <img 
                    src="/assets/LOGO_withbg.png" 
                    alt="PTM HSS" 
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                  />
                </div>
                <p className="text-sm font-bold tracking-[0.3em] uppercase mb-2 opacity-80">PTM HSS</p>
                <h2 className="text-3xl md:text-4xl font-black font-outfit text-center leading-tight">TEXTBOOK MANAGEMENT</h2>
                <div className="w-16 h-1.5 bg-white rounded-full mt-6" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
