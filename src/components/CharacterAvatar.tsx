import { motion } from 'framer-motion';

interface CharacterAvatarProps {
  emoji: string;
  color: string;
  glow: string;
  label?: string;
  size?: number;
  pulsing?: boolean;
  bouncing?: boolean;
}

const CharacterAvatar = ({
  emoji,
  color: _color,
  glow: _glow,
  label,
  size = 120,
  pulsing = false,
  bouncing = false,
}: CharacterAvatarProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {pulsing && (
          <motion.div
            className="absolute inset-0 rounded-[20px] border border-primary/40"
            animate={{ scale: [1, 1.02, 1], opacity: [0.45, 0.2, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <motion.div
          className="flex items-center justify-center rounded-[20px] border border-border bg-card"
          style={{
            width: size,
            height: size,
          }}
          animate={bouncing ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <span style={{ fontSize: size * 0.5 }}>{emoji}</span>
        </motion.div>
      </div>
      {label && (
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

export default CharacterAvatar;
