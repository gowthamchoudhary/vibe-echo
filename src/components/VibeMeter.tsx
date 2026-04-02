import { motion } from 'framer-motion';

interface VibeMeterProps {
  value: number;
}

const VibeMeter = ({ value }: VibeMeterProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">Vibe Score</span>
        <motion.span
          className="text-sm font-semibold text-foreground"
          key={Math.round(clampedValue)}
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(clampedValue)}%
        </motion.span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default VibeMeter;
