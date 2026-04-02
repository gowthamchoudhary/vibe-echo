import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Reaction } from '@/types';

interface ReactionButtonProps {
  reaction: Reaction;
  onReact: (reactionId: string) => void;
  disabled?: boolean;
}

const ReactionButton = ({ reaction, onReact, disabled }: ReactionButtonProps) => {
  const [cooldown, setCooldown] = useState(false);

  const handleClick = useCallback(() => {
    if (cooldown || disabled) return;
    onReact(reaction.id);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1500);
  }, [cooldown, disabled, onReact, reaction.id]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={cooldown || disabled}
      className="relative flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 transition-all duration-200 disabled:opacity-60"
      whileHover={!cooldown ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
        <motion.div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${cooldown ? 'bg-muted text-muted-foreground' : 'bg-background text-foreground'}`}
        >
          <span className="text-2xl">{reaction.emoji}</span>
        </motion.div>
        {cooldown && (
          <svg className="absolute inset-0" width={48} height={48} viewBox="0 0 48 48">
            <motion.circle
              cx={24}
              cy={24}
              r={22}
              fill="none"
              stroke="#6366F1"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={138.2}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 138.2 }}
              transition={{ duration: 1.5, ease: 'linear' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
        )}
      </div>
      <span className="text-[13px] font-medium text-muted-foreground">{reaction.label}</span>
    </motion.button>
  );
};

export default ReactionButton;
