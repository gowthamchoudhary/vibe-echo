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
      className="relative flex flex-col items-center gap-1"
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      <div className="relative">
        <motion.div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            backgroundColor: cooldown ? `${reaction.color}33` : `${reaction.color}22`,
            border: `2px solid ${cooldown ? `${reaction.color}44` : reaction.color}`,
            opacity: cooldown ? 0.5 : 1,
          }}
          whileHover={!cooldown ? { scale: 1.1 } : {}}
        >
          <span className="text-3xl">{reaction.emoji}</span>
        </motion.div>
        {cooldown && (
          <svg className="absolute inset-0" width={72} height={72} viewBox="0 0 72 72">
            <motion.circle
              cx={36}
              cy={36}
              r={34}
              fill="none"
              stroke={reaction.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={213.6}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 213.6 }}
              transition={{ duration: 1.5, ease: 'linear' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{reaction.label}</span>
    </motion.button>
  );
};

export default ReactionButton;
