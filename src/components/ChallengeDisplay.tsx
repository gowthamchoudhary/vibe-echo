import { motion, AnimatePresence } from 'framer-motion';
import type { Challenge } from '@/utils/challenges';

interface ChallengeDisplayProps {
  challenge: Challenge;
  timeLeft: number;
}

const ChallengeDisplay = ({ challenge, timeLeft }: ChallengeDisplayProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={challenge.type + timeLeft.toString().slice(0, -1)}
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
          <span className="text-base">{challenge.emoji}</span>
          <span className="text-sm font-semibold text-foreground">{challenge.title}</span>
          <span className="text-xs text-muted-foreground">{timeLeft}s</span>
        </div>
        <p className="text-xs text-muted-foreground">{challenge.description}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeDisplay;
