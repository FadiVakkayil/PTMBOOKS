'use client';

import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, History, BarChart3 } from 'lucide-react';

const features = [
  {
    title: "Incoming Stock Tracker",
    description: "Easily record and track new textbook shipments as they arrive at PTM HSS Thrikkadeeri.",
    icon: BookOpen,
  },
  {
    title: "Class-wise Allocation",
    description: "Manage separate inventory for 9th and 10th standards with Malayalam and English mediums.",
    icon: ClipboardCheck,
  },
  {
    title: "Distribution History",
    description: "Keep a transparent record of all textbooks sold or distributed to students.",
    icon: History,
  },
  {
    title: "Instant Accounting",
    description: "Generate professional PDF reports for school records and audit purposes.",
    icon: BarChart3,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">Textbook Portal Features</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            A dedicated system designed to streamline the accounting and distribution of textbooks at PTM HSS Thrikkadeeri.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-secondary hover:bg-primary/5 border border-primary/10 transition-colors group cursor-default"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-6">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-outfit">{feature.title}</h3>
              <p className="text-foreground/60 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
