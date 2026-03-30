import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SyncPulseProps {
  active: boolean;
  onTap: (accuracy: 'perfect' | 'good' | 'miss') => void;
}

const SyncPulse = ({ active, onTap }: SyncPulseProps) => {
  const [pulsePhase, setPulsePhase] = useState(0);
  const BPM = 80;
  const INTERVAL = (60 / BPM) * 1000;

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 100);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, [active, INTERVAL]);

  const handleTap = useCallback(() => {
    if (!active) return;
    // Check if tap is near the pulse peak (phase 0)
    const normalized = pulsePhase % 10;
    if (normalized <= 1 || normalized >= 9) {
      onTap('perfect');
    } else if (normalized <= 3 || normalized >= 7) {
      onTap('good');
    } else {
      onTap('miss');
    }
  }, [active, pulsePhase, onTap]);

  if (!active) return null;

  return (
    <motion.button
      onClick={handleTap}
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="absolute h-24 w-24 rounded-full border-2 border-primary"
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
        transition={{ duration: INTERVAL / 1000, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="h-12 w-12 rounded-full bg-primary"
        style={{ boxShadow: '0 0 20px hsl(268 100% 67% / 0.5)' }}
        animate={{ scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: INTERVAL / 1000, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="absolute -bottom-6 text-xs text-muted-foreground">Tap!</span>
    </motion.button>
  );
};

export default SyncPulse;
