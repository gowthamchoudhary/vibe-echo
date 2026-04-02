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
        className="panel flex w-full flex-col gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{challenge.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{challenge.title}</span>
          </div>
          <span className="status-chip">{timeLeft}s</span>
        </div>
        <p className="text-[13px] text-muted-foreground">{challenge.description}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeDisplay;
