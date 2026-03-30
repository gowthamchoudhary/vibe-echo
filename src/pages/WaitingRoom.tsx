import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import { CHARACTERS, FUN_FACTS } from '@/utils/sounds';
import { generateUsername } from '@/utils/playerIdentity';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const characterId = (location.state as { characterId?: string })?.characterId ?? 'robot';
  const character = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];

  const [factIndex, setFactIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [showAIOption, setShowAIOption] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track wait time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show AI option after 30 seconds
  useEffect(() => {
    if (waitTime >= 30 && !showAIOption) {
      setShowAIOption(true);
    }
  }, [waitTime, showAIOption]);

  // Simulate match found after 3-5 seconds (normal flow)
  useEffect(() => {
    if (showAIOption) return; // Don't auto-match if showing AI option
    const delay = 3000 + Math.random() * 2000;
    const timeout = setTimeout(() => {
      const partnerOptions = CHARACTERS.filter((c) => c.id !== characterId);
      const partner = partnerOptions[Math.floor(Math.random() * partnerOptions.length)];
      const partnerName = generateUsername();
      navigate('/vibe', {
        state: { characterId, partnerCharacterId: partner.id, partnerName },
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [characterId, navigate, showAIOption]);

  const handlePlayWithAI = () => {
    const partnerOptions = CHARACTERS.filter((c) => c.id !== characterId);
    const partner = partnerOptions[Math.floor(Math.random() * partnerOptions.length)];
    navigate('/vibe', {
      state: {
        characterId,
        partnerCharacterId: partner.id,
        partnerName: 'AI Bot',
        isAI: true,
      },
    });
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex flex-col items-center gap-8">
        <CharacterAvatar
          emoji={character.emoji}
          color={character.color}
          glow={character.glow}
          size={140}
          pulsing
        />

        <div className="text-center">
          <motion.p
            className="text-xl font-semibold text-foreground"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Finding your vibe partner...
          </motion.p>
          <p className="mt-1 text-sm text-muted-foreground">{waitTime}s</p>
        </div>

        <div className="h-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="max-w-xs text-center text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {FUN_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showAIOption && (
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground">No match found yet...</p>
              <motion.button
                onClick={handlePlayWithAI}
                className="rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground glow-border-purple"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🤖 Play with AI instead
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => navigate('/')}
          className="mt-4 rounded-pill border border-border px-6 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WaitingRoom;
