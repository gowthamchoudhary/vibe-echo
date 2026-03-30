import { motion, AnimatePresence } from 'framer-motion';

interface ComboCounterProps {
  combo: number;
  multiplier: number;
}

const ComboCounter = ({ combo, multiplier }: ComboCounterProps) => {
  if (combo < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        className="flex items-center gap-2"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <span className="text-sm font-bold text-foreground">
          🔥 {combo} combo
        </span>
        <motion.span
          className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          x{multiplier}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComboCounter;
