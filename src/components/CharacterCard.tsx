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
      className={`relative flex min-h-[172px] flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-4 text-center transition-all duration-200 ${
        selected ? 'border-primary' : 'border-border'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {selected && (
        <motion.div
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          ✓
        </motion.div>
      )}
      <span className="text-5xl">{character.emoji}</span>
      <span className="text-base font-semibold text-foreground">{character.name}</span>
      <span className={`rounded-full px-3 py-1 text-[13px] ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {character.personality.split(',')[0]}
      </span>
    </motion.button>
  );
};

export default CharacterCard;
