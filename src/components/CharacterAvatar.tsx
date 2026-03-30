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
  color,
  glow,
  label,
  size = 120,
  pulsing = false,
  bouncing = false,
}: CharacterAvatarProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {pulsing && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}`, boxShadow: glow }}
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}`, boxShadow: glow }}
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </>
        )}
        <motion.div
          className="flex items-center justify-center rounded-full bg-card"
          style={{
            width: size,
            height: size,
            border: `2px solid ${color}`,
            boxShadow: glow,
          }}
          animate={bouncing ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span style={{ fontSize: size * 0.5 }}>{emoji}</span>
        </motion.div>
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

export default CharacterAvatar;
