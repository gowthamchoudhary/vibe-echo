import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCounterProps {
  className?: string;
}

const LiveCounter = ({ className }: LiveCounterProps) => {
  const [count, setCount] = useState(247);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 11) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`flex items-center justify-center gap-2 text-sm text-muted-foreground ${className ?? ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          {count} people vibing right now
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveCounter;
