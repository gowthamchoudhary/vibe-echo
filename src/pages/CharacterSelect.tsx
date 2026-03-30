import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CharacterCard from '@/components/CharacterCard';
import { CHARACTERS } from '@/utils/sounds';

const CharacterSelect = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (selectedId) {
      navigate('/waiting', { state: { characterId: selectedId } });
    }
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="w-full max-w-lg">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Choose your voice</h1>
          <p className="mt-2 text-muted-foreground">
            This is how you'll sound to your match
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {CHARACTERS.map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <CharacterCard
                character={char}
                selected={selectedId === char.id}
                onSelect={setSelectedId}
              />
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && (
            <motion.div
              className="fixed inset-x-0 bottom-0 p-6"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.button
                onClick={handleConfirm}
                className="w-full rounded-pill bg-primary py-4 text-lg font-semibold text-primary-foreground glow-border-purple"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Let's Vibe ✨
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CharacterSelect;
