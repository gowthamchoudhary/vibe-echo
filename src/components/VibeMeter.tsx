import { motion } from 'framer-motion';

interface VibeMeterProps {
  value: number;
}

const VibeMeter = ({ value }: VibeMeterProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Interpolate color: purple → cyan → white
  const getColor = (v: number) => {
    if (v < 50) return '#9b59ff';
    if (v < 80) return '#00f5ff';
    return '#ffffff';
  };

  const color = getColor(clampedValue);

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Vibe Meter</span>
        <motion.span
          className="text-sm font-bold"
          style={{ color }}
          key={Math.round(clampedValue)}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(clampedValue)}%
        </motion.span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-pill bg-muted">
        <motion.div
          className="h-full rounded-pill"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}88`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
};

export default VibeMeter;
