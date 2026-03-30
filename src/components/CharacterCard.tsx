import { motion } from 'framer-motion';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  selected: boolean;
  onSelect: (id: string) => void;
}

const CharacterCard = ({ character, selected, onSelect }: CharacterCardProps) => {
  return (
    <motion.button
      onClick={() => onSelect(character.id)}
      className="relative flex flex-col items-center gap-3 rounded-lg bg-card p-6 transition-colors"
      style={{
        border: selected ? `2px solid ${character.color}` : '2px solid hsl(var(--border))',
        boxShadow: selected ? character.glow : 'none',
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {selected && (
        <motion.div
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: character.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          ✓
        </motion.div>
      )}
      <span className="text-6xl">{character.emoji}</span>
      <span className="text-lg font-semibold text-foreground">{character.name}</span>
      <span
        className="rounded-pill px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${character.color}22`, color: character.color }}
      >
        {character.personality.split(',')[0]}
      </span>
    </motion.button>
  );
};

export default CharacterCard;
