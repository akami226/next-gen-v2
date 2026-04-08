import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassPanel({ children, className = '', delay = 0 }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/[0.04] dark:bg-white/[0.04] light:bg-white/80 backdrop-blur-md border border-white/[0.08] dark:border-white/[0.08] light:border-gray-200 rounded-2xl light:shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
