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
      className="flex min-h-screen flex-col items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="app-shell">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-[28px] font-semibold text-foreground">Choose your voice</h1>
          <p className="mt-2 text-base text-muted-foreground">
            This is how you&apos;ll sound to your match
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {CHARACTERS.map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 8 }}
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
              className="mt-6"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleConfirm}
                className="primary-btn w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CharacterSelect;
