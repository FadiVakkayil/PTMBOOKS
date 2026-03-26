'use client';

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {isLoading && (
          <SplashScreen key="splash" finishLoading={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {!isLoading && (
          <>
            <Navbar />
            <Hero />
            <Dashboard />
            <Features />
            <Footer />
          </>
        )}
      </motion.div>
    </main>
  );
}
