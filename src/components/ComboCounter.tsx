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
        className="status-chip"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm font-semibold text-foreground">
          {combo} combo
        </span>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          x{multiplier}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComboCounter;
