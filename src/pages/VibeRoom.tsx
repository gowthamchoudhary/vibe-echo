import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import ReactionButton from '@/components/ReactionButton';
import VibeMeter from '@/components/VibeMeter';
import Ripple from '@/components/Ripple';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';
import { getRandomVibeIncrease } from '@/utils/vibeScore';
import type { ReactionEvent } from '@/types';
import { Volume2, VolumeX } from 'lucide-react';

const SESSION_DURATION = 180; // 3 minutes

const VibeRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { characterId, partnerCharacterId } = (location.state as {
    characterId: string;
    partnerCharacterId: string;
  }) ?? { characterId: 'robot', partnerCharacterId: 'witch' };

  const myChar = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const partnerChar = CHARACTERS.find((c) => c.id === partnerCharacterId) ?? CHARACTERS[3];

  const [vibeScore, setVibeScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [muted, setMuted] = useState(false);
  const [myBounce, setMyBounce] = useState(false);
  const [partnerBounce, setPartnerBounce] = useState(false);
  const [myRipple, setMyRipple] = useState<string | null>(null);
  const [partnerRipple, setPartnerRipple] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // End session when timer hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      const sentReactions = reactions.filter((r) => r.from === 'self');
      const receivedReactions = reactions.filter((r) => r.from === 'partner');
      const reactionCounts: Record<string, number> = {};
      sentReactions.forEach((r) => {
        reactionCounts[r.reactionId] = (reactionCounts[r.reactionId] ?? 0) + 1;
      });
      const mostUsed = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'hype';

      navigate('/result', {
        state: {
          vibeScore: Math.min(100, vibeScore),
          reactionsSent: sentReactions.length,
          reactionsReceived: receivedReactions.length,
          mostUsedReaction: mostUsed,
          myCharacterId: characterId,
          partnerCharacterId,
        },
      });
    }
  }, [timeLeft, vibeScore, reactions, characterId, partnerCharacterId, navigate]);

  // Simulate partner reactions
  useEffect(() => {
    const simulatePartner = () => {
      const delay = 2000 + Math.random() * 4000;
      const timeout = setTimeout(() => {
        if (timeLeft > 0) {
          const randomReaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
          handlePartnerReaction(randomReaction.id);
          simulatePartner();
        }
      }, delay);
      return timeout;
    };
    const t = simulatePartner();
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleReact = useCallback(
    (reactionId: string) => {
      const reaction = REACTIONS.find((r) => r.id === reactionId);
      if (!reaction) return;

      setReactions((prev) => [...prev, { reactionId, characterId, from: 'self', timestamp: Date.now() }]);
      setVibeScore((prev) => Math.min(100, prev + getRandomVibeIncrease()));
      setMyBounce(true);
      setMyRipple(reaction.color);
      setTimeout(() => { setMyBounce(false); setMyRipple(null); }, 600);
    },
    [characterId]
  );

  const handlePartnerReaction = useCallback(
    (reactionId: string) => {
      const reaction = REACTIONS.find((r) => r.id === reactionId);
      if (!reaction) return;

      setReactions((prev) => [
        ...prev,
        { reactionId, characterId: partnerCharacterId, from: 'partner', timestamp: Date.now() },
      ]);
      setVibeScore((prev) => Math.min(100, prev + getRandomVibeIncrease()));
      setPartnerBounce(true);
      setPartnerRipple(reaction.color);
      setTimeout(() => { setPartnerBounce(false); setPartnerRipple(null); }, 600);
    },
    [partnerCharacterId]
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerDanger = timeLeft <= 30;

  return (
    <motion.div
      className="flex min-h-screen flex-col px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <VibeMeter value={vibeScore} />
        </div>
        <motion.span
          className={`min-w-[52px] text-right text-lg font-bold ${timerDanger ? 'text-destructive' : 'text-foreground'}`}
          animate={timerDanger ? { scale: [1, 1.1, 1] } : {}}
          transition={timerDanger ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {formatTime(timeLeft)}
        </motion.span>
        <button onClick={() => setMuted(!muted)} className="text-muted-foreground">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Avatars */}
      <div className="flex flex-1 items-center justify-center gap-8">
        <div className="relative">
          <CharacterAvatar
            emoji={myChar.emoji}
            color={myChar.color}
            glow={myChar.glow}
            label="You"
            size={100}
            bouncing={myBounce}
          />
          {myRipple && <Ripple color={myRipple} />}
        </div>

        <motion.span
          className="text-2xl text-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡
        </motion.span>

        <div className="relative">
          <CharacterAvatar
            emoji={partnerChar.emoji}
            color={partnerChar.color}
            glow={partnerChar.glow}
            label="Stranger"
            size={100}
            bouncing={partnerBounce}
          />
          {partnerRipple && <Ripple color={partnerRipple} />}
        </div>
      </div>

      {/* Reaction buttons */}
      <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-4 pb-8 pt-4">
        {REACTIONS.map((reaction) => (
          <ReactionButton key={reaction.id} reaction={reaction} onReact={handleReact} />
        ))}
      </div>
    </motion.div>
  );
};

export default VibeRoom;
