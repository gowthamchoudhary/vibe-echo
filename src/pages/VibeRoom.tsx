import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import ReactionButton from '@/components/ReactionButton';
import VibeMeter from '@/components/VibeMeter';
import Ripple from '@/components/Ripple';
import ChallengeDisplay from '@/components/ChallengeDisplay';
import ComboCounter from '@/components/ComboCounter';
import FloatingScore from '@/components/FloatingScore';
import FeedbackText from '@/components/FeedbackText';
import SyncPulse from '@/components/SyncPulse';
import ParticleBurst from '@/components/ParticleBurst';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';
import { getRandomVibeIncrease, getComboMultiplier, getScoreWithCombo, getIntensityMultiplier } from '@/utils/vibeScore';
import { CHALLENGES, type ChallengeType } from '@/utils/challenges';
import { getPlayerStats } from '@/utils/playerIdentity';
import type { ReactionEvent, FloatingScoreEvent, FeedbackEvent } from '@/types';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

const SESSION_DURATION = 180;
const CHALLENGE_DURATION = 20;

const VibeRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { characterId, partnerCharacterId, partnerName, isAI } = (location.state as {
    characterId: string;
    partnerCharacterId: string;
    partnerName?: string;
    isAI?: boolean;
  }) ?? { characterId: 'robot', partnerCharacterId: 'witch' };

  const myChar = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const partnerChar = CHARACTERS.find((c) => c.id === partnerCharacterId) ?? CHARACTERS[3];
  const playerStats = getPlayerStats();

  const [vibeScore, setVibeScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [muted, setMuted] = useState(false);
  const { playReactionSound } = useAudio(muted);
  const [myBounce, setMyBounce] = useState(false);
  const [partnerBounce, setPartnerBounce] = useState(false);
  const [myRipple, setMyRipple] = useState<string | null>(null);
  const [partnerRipple, setPartnerRipple] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);

  // Challenge state
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(CHALLENGE_DURATION);
  const currentChallenge = CHALLENGES[challengeIndex];

  // Combo state
  const [combo, setCombo] = useState(0);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreEvent[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEvent[]>([]);
  const floatIdRef = useRef(0);

  // Particle burst
  const [particleBurst, setParticleBurst] = useState<{ active: boolean; color: string; id: number }>({ active: false, color: '#9b59ff', id: 0 });

  // Screen shake
  const [shake, setShake] = useState(false);

  // Partner last reaction for challenge matching
  const lastPartnerReactionRef = useRef<{ reactionId: string; timestamp: number } | null>(null);
  const lastMyReactionRef = useRef<{ reactionId: string; timestamp: number } | null>(null);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Challenge rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setChallengeTimer((prev) => {
        if (prev <= 1) {
          setChallengeIndex((ci) => (ci + 1) % CHALLENGES.length);
          return CHALLENGE_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // End session
  useEffect(() => {
    if (timeLeft === 0) {
      const sentReactions = reactions.filter((r) => r.from === 'self');
      const receivedReactions = reactions.filter((r) => r.from === 'partner');
      const reactionCounts: Record<string, number> = {};
      sentReactions.forEach((r) => { reactionCounts[r.reactionId] = (reactionCounts[r.reactionId] ?? 0) + 1; });
      const mostUsed = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'hype';

      navigate('/result', {
        state: {
          vibeScore: Math.min(100, vibeScore),
          reactionsSent: sentReactions.length,
          reactionsReceived: receivedReactions.length,
          mostUsedReaction: mostUsed,
          myCharacterId: characterId,
          partnerCharacterId,
          partnerName: partnerName ?? 'Stranger',
          maxCombo: combo,
        },
      });
    }
  }, [timeLeft, vibeScore, reactions, characterId, partnerCharacterId, navigate, combo, partnerName]);

  const addFloatingScore = useCallback((value: number, label: string | undefined, x: number, color: string) => {
    const id = ++floatIdRef.current;
    setFloatingScores((prev) => [...prev.slice(-5), { id, value, label, x, color }]);
    setTimeout(() => setFloatingScores((prev) => prev.filter((f) => f.id !== id)), 1200);
  }, []);

  const addFeedback = useCallback((text: string, color: string) => {
    const id = ++floatIdRef.current;
    setFeedbacks((prev) => [...prev.slice(-2), { id, text, color }]);
    setTimeout(() => setFeedbacks((prev) => prev.filter((f) => f.id !== id)), 800);
  }, []);

  const triggerParticle = useCallback((color: string) => {
    const id = ++floatIdRef.current;
    setParticleBurst({ active: true, color, id });
    setTimeout(() => setParticleBurst((p) => ({ ...p, active: false })), 700);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  }, []);

  // Evaluate challenge result
  const evaluateChallenge = useCallback((myReactionId: string, from: 'self') => {
    const challengeType = currentChallenge.type;
    const now = Date.now();
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);

    if (challengeType === 'match_vibe') {
      const partner = lastPartnerReactionRef.current;
      if (partner && myReactionId === partner.reactionId && (now - partner.timestamp) < 3000) {
        const timeDiff = now - partner.timestamp;
        if (timeDiff < 1000) {
          setCombo((c) => c + 1);
          const base = Math.round(15 * intensity);
          const score = getScoreWithCombo(base, combo + 1);
          setVibeScore((v) => Math.min(100, v + score));
          addFloatingScore(score, 'PERFECT SYNC!', 50, '#ffd700');
          addFeedback('⚡ Perfect Sync!', '#ffd700');
          triggerParticle('#ffd700');
          triggerShake();
        } else {
          setCombo((c) => c + 1);
          const score = Math.round(10 * intensity);
          setVibeScore((v) => Math.min(100, v + score));
          addFloatingScore(score, 'Match!', 50, '#00f5ff');
          addFeedback('✨ Match!', '#00f5ff');
        }
        return;
      }
    }

    if (challengeType === 'guess_mood') {
      const partner = lastPartnerReactionRef.current;
      if (partner && myReactionId === partner.reactionId && (now - partner.timestamp) < 5000) {
        setCombo((c) => c + 1);
        const score = Math.round(12 * intensity);
        setVibeScore((v) => Math.min(100, v + score));
        addFloatingScore(score, 'Correct!', 50, '#00ff88');
        addFeedback('✅ Correct!', '#00ff88');
        triggerParticle('#00ff88');
        return;
      } else if (partner && (now - partner.timestamp) < 5000) {
        setCombo(0);
        addFeedback('❌ Wrong!', '#ff4444');
        return;
      }
    }

    // Default: free react or no challenge match
    const base = getRandomVibeIncrease();
    const score = getScoreWithCombo(Math.round(base * intensity), combo);
    setVibeScore((v) => Math.min(100, v + score));
    setCombo((c) => c + 1);
    addFloatingScore(score, undefined, 30, myChar.color);
  }, [currentChallenge, combo, timeLeft, myChar.color, addFloatingScore, addFeedback, triggerParticle, triggerShake]);

  const handleReact = useCallback((reactionId: string) => {
    const reaction = REACTIONS.find((r) => r.id === reactionId);
    if (!reaction) return;

    setReactions((prev) => [...prev, { reactionId, characterId, from: 'self', timestamp: Date.now() }]);
    lastMyReactionRef.current = { reactionId, timestamp: Date.now() };

    setMyBounce(true);
    setMyRipple(reaction.color);
    setTimeout(() => { setMyBounce(false); setMyRipple(null); }, 600);

    evaluateChallenge(reactionId, 'self');
  }, [characterId, evaluateChallenge]);

  const handlePartnerReaction = useCallback((reactionId: string) => {
    const reaction = REACTIONS.find((r) => r.id === reactionId);
    if (!reaction) return;

    setReactions((prev) => [
      ...prev,
      { reactionId, characterId: partnerCharacterId, from: 'partner', timestamp: Date.now() },
    ]);
    lastPartnerReactionRef.current = { reactionId, timestamp: Date.now() };

    const base = getRandomVibeIncrease();
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
    const score = Math.round(base * intensity * 0.5);
    setVibeScore((v) => Math.min(100, v + score));
    addFloatingScore(score, undefined, 70, partnerChar.color);

    setPartnerBounce(true);
    setPartnerRipple(reaction.color);
    setTimeout(() => { setPartnerBounce(false); setPartnerRipple(null); }, 600);
  }, [partnerCharacterId, partnerChar.color, addFloatingScore, timeLeft]);

  // Simulate partner (AI or placeholder)
  useEffect(() => {
    const simulatePartner = () => {
      const baseDelay = isAI ? 300 + Math.random() * 900 : 2000 + Math.random() * 4000;
      const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
      const delay = baseDelay / intensity;

      const timeout = setTimeout(() => {
        if (timeLeft > 0) {
          const challenge = CHALLENGES[challengeIndex];

          // AI sometimes syncs on match_vibe challenge
          if (challenge.type === 'match_vibe' && lastMyReactionRef.current && Math.random() > 0.4) {
            handlePartnerReaction(lastMyReactionRef.current.reactionId);
          } else {
            const randomReaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
            handlePartnerReaction(randomReaction.id);
          }
          simulatePartner();
        }
      }, delay);
      return timeout;
    };
    const t = simulatePartner();
    return () => clearTimeout(t);
  }, [timeLeft, isAI, challengeIndex, handlePartnerReaction]);

  // Sync pulse handler
  const handleSyncTap = useCallback((accuracy: 'perfect' | 'good' | 'miss') => {
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
    if (accuracy === 'perfect') {
      setCombo((c) => c + 1);
      const score = Math.round(8 * intensity * getComboMultiplier(combo + 1));
      setVibeScore((v) => Math.min(100, v + score));
      addFloatingScore(score, 'Perfect!', 50, '#ffd700');
      triggerParticle('#ffd700');
      triggerShake();
    } else if (accuracy === 'good') {
      setCombo((c) => c + 1);
      const score = Math.round(4 * intensity);
      setVibeScore((v) => Math.min(100, v + score));
      addFloatingScore(score, 'Good', 50, '#00f5ff');
    } else {
      setCombo(0);
      addFeedback('Missed!', '#ff4444');
    }
  }, [combo, timeLeft, addFloatingScore, addFeedback, triggerParticle, triggerShake]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerDanger = timeLeft <= 30;
  const timerCritical = timeLeft <= 10;
  const multiplier = getComboMultiplier(combo);
  const comboGlow = combo >= 5 ? `0 0 ${10 + combo * 2}px hsl(268 100% 67% / ${Math.min(0.8, 0.3 + combo * 0.05)})` : undefined;

  return (
    <motion.div
      className="relative flex min-h-screen flex-col px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: shake ? [0, -3, 3, -2, 2, 0] : 0,
      }}
      exit={{ opacity: 0 }}
      transition={shake ? { duration: 0.3 } : undefined}
    >
      {/* Background gradient motion */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, hsl(268 100% 67%) 0%, transparent 70%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating scores */}
      <FloatingScore events={floatingScores} />
      {/* Feedback text */}
      <FeedbackText events={feedbacks} />

      {/* Top bar */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex-1">
          <VibeMeter value={vibeScore} />
        </div>
        <motion.span
          className={`min-w-[52px] text-right text-lg font-bold ${timerCritical ? 'text-destructive' : timerDanger ? 'text-destructive' : 'text-foreground'}`}
          animate={timerCritical ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : timerDanger ? { scale: [1, 1.1, 1] } : {}}
          transition={timerDanger ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {formatTime(timeLeft)}
        </motion.span>
        <button onClick={() => setMuted(!muted)} className="text-muted-foreground">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Combo counter */}
      <div className="mb-2 flex justify-center">
        <ComboCounter combo={combo} multiplier={multiplier} />
      </div>

      {/* Challenge display */}
      <div className="mb-4 flex justify-center">
        <ChallengeDisplay challenge={currentChallenge} timeLeft={challengeTimer} />
      </div>

      {/* Avatars */}
      <div className="flex flex-1 items-center justify-center gap-8">
        <div className="relative flex flex-col items-center">
          <span className="mb-1 text-xs font-medium text-secondary">{playerStats.username}</span>
          <div style={{ filter: comboGlow ? `drop-shadow(${comboGlow})` : undefined }}>
            <CharacterAvatar
              emoji={myChar.emoji}
              color={myChar.color}
              glow={combo >= 5 ? `0 0 ${20 + combo * 3}px ${myChar.color}88` : myChar.glow}
              label="You"
              size={100}
              bouncing={myBounce}
            />
          </div>
          {myRipple && <Ripple color={myRipple} />}
          <ParticleBurst active={particleBurst.active} color={particleBurst.color} id={particleBurst.id} />
        </div>

        <motion.span
          className="text-2xl text-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡
        </motion.span>

        <div className="relative flex flex-col items-center">
          <span className="mb-1 text-xs font-medium text-muted-foreground">
            {partnerName ?? 'Stranger'}
            {isAI && ' 🤖'}
          </span>
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

      {/* Sync Pulse mini-game */}
      {currentChallenge.type === 'sync_pulse' && (
        <div className="my-4">
          <SyncPulse active onTap={handleSyncTap} />
        </div>
      )}

      {/* Reaction buttons */}
      <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-4 pb-8 pt-4">
        {REACTIONS.map((reaction) => (
          <ReactionButton key={reaction.id} reaction={reaction} onReact={handleReact} />
        ))}
      </div>

      {/* Countdown pressure overlay */}
      <AnimatePresence>
        {timerCritical && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-30 border-4 border-destructive/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VibeRoom;
