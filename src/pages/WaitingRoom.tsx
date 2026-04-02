import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import { CHARACTERS, FUN_FACTS } from '@/utils/sounds';
import { getPlayerStats } from '@/utils/playerIdentity';
import { useWebSocket } from '@/hooks/useWebSocket';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const characterId = (location.state as { characterId?: string })?.characterId ?? 'robot';
  const character = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const playerStats = getPlayerStats();

  const [factIndex, setFactIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [showAIOption, setShowAIOption] = useState(false);

  const onMatchFound = useCallback((partnerCharacterId: string, partnerName: string, sessionId: string) => {
    navigate('/vibe', {
      state: {
        characterId,
        partnerCharacterId,
        partnerName,
        sessionId,
        isReal: true,
      },
    });
  }, [characterId, navigate]);

  const onPartnerReaction = useCallback(() => {}, []);
  const onSessionEnd = useCallback(() => {}, []);

  const { status, connect, disconnect, isOnline } = useWebSocket({
    characterId,
    username: playerStats.username,
    onMatchFound,
    onPartnerReaction,
    onSessionEnd,
  });

  useEffect(() => {
    if (isOnline) {
      connect();
    }
    return () => disconnect();
  }, [isOnline, connect, disconnect]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const threshold = isOnline ? 15 : 3;
    if (waitTime >= threshold && !showAIOption) {
      setShowAIOption(true);
    }
  }, [waitTime, showAIOption, isOnline]);

  const handlePlayWithAI = () => {
    disconnect();
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

  const statusText = !isOnline
    ? 'Searching locally...'
    : status === 'connecting'
      ? 'Connecting to server...'
      : 'Finding your vibe partner...';

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="app-shell flex flex-col items-center gap-6">
        <CharacterAvatar
          emoji={character.emoji}
          color={character.color}
          glow={character.glow}
          size={132}
          pulsing
        />

        <div className="text-center">
          <motion.p
            className="text-[22px] font-semibold text-foreground"
            animate={{ opacity: [1, 0.85, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {statusText}
          </motion.p>
          <p className="mt-2 text-[13px] text-muted-foreground">{waitTime}s elapsed</p>
          {isOnline ? (
            <p className="mt-2 text-[13px] text-primary">Connected to live server</p>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">Offline mode</p>
          )}
        </div>

        <div className="panel flex h-[88px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="text-center text-[13px] text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {FUN_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showAIOption && (
            <motion.div
              className="panel flex w-full flex-col items-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[13px] text-muted-foreground">
                {isOnline ? 'No match found yet.' : 'Worker not deployed. Try AI instead.'}
              </p>
              <motion.button
                onClick={handlePlayWithAI}
                className="primary-btn w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Play with AI instead
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { disconnect(); navigate('/'); }}
          className="secondary-btn w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WaitingRoom;
