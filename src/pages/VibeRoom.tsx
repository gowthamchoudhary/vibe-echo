import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
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
import { CHALLENGES } from '@/utils/challenges';
import { getPlayerStats } from '@/utils/playerIdentity';
import type { ReactionEvent, FloatingScoreEvent, FeedbackEvent } from '@/types';
import { useAudio } from '@/hooks/useAudio';
import { useWebSocket } from '@/hooks/useWebSocket';

const SESSION_DURATION = 180;
const CHALLENGE_DURATION = 20;

const VibeRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    characterId,
    partnerCharacterId,
    partnerName,
    isAI,
    isReal,
  } = (location.state as {
    characterId: string;
    partnerCharacterId: string;
    partnerName?: string;
    isAI?: boolean;
    isReal?: boolean;
  }) ?? { characterId: 'robot', partnerCharacterId: 'witch' };

  const myChar = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const partnerChar = CHARACTERS.find((c) => c.id === partnerCharacterId) ?? CHARACTERS[3];
  const playerStats = getPlayerStats();

  const [vibeScore, setVibeScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [muted, setMuted] = useState(false);
  const preloadIds = [characterId, partnerCharacterId];
  const { playReactionSound } = useAudio(muted, preloadIds);
  const [myBounce, setMyBounce] = useState(false);
  const [partnerBounce, setPartnerBounce] = useState(false);
  const [myRipple, setMyRipple] = useState<string | null>(null);
  const [partnerRipple, setPartnerRipple] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(CHALLENGE_DURATION);
  const [combo, setCombo] = useState(0);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreEvent[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEvent[]>([]);
  const [particleBurst, setParticleBurst] = useState<{ active: boolean; color: string; id: number }>({ active: false, color: '#6366F1', id: 0 });
  const floatIdRef = useRef(0);

  const currentChallenge = CHALLENGES[challengeIndex];
  const lastPartnerReactionRef = useRef<{ reactionId: string; timestamp: number } | null>(null);
  const lastMyReactionRef = useRef<{ reactionId: string; timestamp: number } | null>(null);

  const handlePartnerReaction = useCallback((reactionId: string) => {
    const reaction = REACTIONS.find((r) => r.id === reactionId);
    if (!reaction) return;

    setReactions((prev) => [
      ...prev,
      { reactionId, characterId: partnerCharacterId, from: 'partner', timestamp: Date.now() },
    ]);
    lastPartnerReactionRef.current = { reactionId, timestamp: Date.now() };

    playReactionSound(partnerCharacterId, reactionId);

    const base = getRandomVibeIncrease();
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
    const score = Math.round(base * intensity * 0.5);
    setVibeScore((v) => Math.min(100, v + score));

    const id = ++floatIdRef.current;
    setFloatingScores((prev) => [...prev.slice(-5), { id, value: score, label: undefined, x: 70, color: '#6366F1' }]);
    setTimeout(() => setFloatingScores((prev) => prev.filter((f) => f.id !== id)), 1200);

    setPartnerBounce(true);
    setPartnerRipple('#6366F1');
    setTimeout(() => {
      setPartnerBounce(false);
      setPartnerRipple(null);
    }, 400);
  }, [partnerCharacterId, timeLeft, playReactionSound]);

  const onPartnerReactionWs = useCallback((reactionId: string) => {
    handlePartnerReaction(reactionId);
  }, [handlePartnerReaction]);

  const onSessionEndWs = useCallback((finalScore: number, reactionCount: number) => {
    const sentReactions = reactions.filter((r) => r.from === 'self');
    const mostUsed = getMostUsedReaction(sentReactions);
    navigate('/result', {
      state: {
        vibeScore: finalScore,
        reactionsSent: sentReactions.length,
        reactionsReceived: reactionCount - sentReactions.length,
        mostUsedReaction: mostUsed,
        myCharacterId: characterId,
        partnerCharacterId,
        partnerName: partnerName ?? 'Stranger',
        maxCombo: combo,
      },
    });
  }, [reactions, characterId, partnerCharacterId, partnerName, combo, navigate]);

  const onMatchFound = useCallback(() => {}, []);

  const { sendReaction, disconnect } = useWebSocket({
    characterId,
    username: playerStats.username,
    onMatchFound,
    onPartnerReaction: onPartnerReactionWs,
    onSessionEnd: onSessionEndWs,
  });

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

  useEffect(() => {
    if (timeLeft === 0 && !isReal) {
      const sentReactions = reactions.filter((r) => r.from === 'self');
      const receivedReactions = reactions.filter((r) => r.from === 'partner');
      const mostUsed = getMostUsedReaction(sentReactions);

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

    if (timeLeft === 0 && isReal) {
      setTimeout(() => {
        const sentReactions = reactions.filter((r) => r.from === 'self');
        const mostUsed = getMostUsedReaction(sentReactions);
        navigate('/result', {
          state: {
            vibeScore: Math.min(100, vibeScore),
            reactionsSent: sentReactions.length,
            reactionsReceived: reactions.filter((r) => r.from === 'partner').length,
            mostUsedReaction: mostUsed,
            myCharacterId: characterId,
            partnerCharacterId,
            partnerName: partnerName ?? 'Stranger',
            maxCombo: combo,
          },
        });
      }, 3000);
    }
  }, [timeLeft, vibeScore, reactions, characterId, partnerCharacterId, navigate, combo, partnerName, isReal]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

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
    setTimeout(() => setParticleBurst((p) => ({ ...p, active: false })), 500);
  }, []);

  const evaluateChallenge = useCallback((myReactionId: string) => {
    const challengeType = currentChallenge.type;
    const now = Date.now();
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);

    if (challengeType === 'match_vibe') {
      const partner = lastPartnerReactionRef.current;
      if (partner && myReactionId === partner.reactionId && (now - partner.timestamp) < 3000) {
        if ((now - partner.timestamp) < 1000) {
          setCombo((c) => c + 1);
          const base = Math.round(15 * intensity);
          const score = getScoreWithCombo(base, combo + 1);
          setVibeScore((v) => Math.min(100, v + score));
          addFloatingScore(score, 'Perfect sync', 50, '#6366F1');
          addFeedback('Perfect sync', '#6366F1');
          triggerParticle('#6366F1');
        } else {
          setCombo((c) => c + 1);
          const score = Math.round(10 * intensity);
          setVibeScore((v) => Math.min(100, v + score));
          addFloatingScore(score, 'Match', 50, '#6366F1');
          addFeedback('Match', '#6366F1');
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
        addFloatingScore(score, 'Correct', 50, '#6366F1');
        addFeedback('Correct', '#6366F1');
        triggerParticle('#6366F1');
        return;
      }
      if (partner && (now - partner.timestamp) < 5000) {
        setCombo(0);
        addFeedback('Wrong guess', '#ef4444');
        return;
      }
    }

    const base = getRandomVibeIncrease();
    const score = getScoreWithCombo(Math.round(base * intensity), combo);
    setVibeScore((v) => Math.min(100, v + score));
    setCombo((c) => c + 1);
    addFloatingScore(score, undefined, 30, '#6366F1');
  }, [currentChallenge, combo, timeLeft, addFloatingScore, addFeedback, triggerParticle]);

  const handleReact = useCallback((reactionId: string) => {
    const reaction = REACTIONS.find((r) => r.id === reactionId);
    if (!reaction) return;

    setReactions((prev) => [...prev, { reactionId, characterId, from: 'self', timestamp: Date.now() }]);
    lastMyReactionRef.current = { reactionId, timestamp: Date.now() };

    playReactionSound(characterId, reactionId);

    if (isReal) {
      sendReaction(reactionId);
    }

    setMyBounce(true);
    setMyRipple('#6366F1');
    setTimeout(() => {
      setMyBounce(false);
      setMyRipple(null);
    }, 400);

    evaluateChallenge(reactionId);
  }, [characterId, evaluateChallenge, playReactionSound, isReal, sendReaction]);

  useEffect(() => {
    if (isReal) return;

    const simulatePartner = () => {
      const baseDelay = isAI ? 300 + Math.random() * 900 : 2000 + Math.random() * 4000;
      const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
      const delay = baseDelay / intensity;

      const timeout = setTimeout(() => {
        if (timeLeft > 0) {
          const challenge = CHALLENGES[challengeIndex];

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
  }, [timeLeft, isAI, isReal, challengeIndex, handlePartnerReaction]);

  const handleSyncTap = useCallback((accuracy: 'perfect' | 'good' | 'miss') => {
    const intensity = getIntensityMultiplier(timeLeft, SESSION_DURATION);
    if (accuracy === 'perfect') {
      setCombo((c) => c + 1);
      const score = Math.round(8 * intensity * getComboMultiplier(combo + 1));
      setVibeScore((v) => Math.min(100, v + score));
      addFloatingScore(score, 'Perfect', 50, '#6366F1');
      triggerParticle('#6366F1');
    } else if (accuracy === 'good') {
      setCombo((c) => c + 1);
      const score = Math.round(4 * intensity);
      setVibeScore((v) => Math.min(100, v + score));
      addFloatingScore(score, 'Good', 50, '#6366F1');
    } else {
      setCombo(0);
      addFeedback('Missed', '#ef4444');
    }
  }, [combo, timeLeft, addFloatingScore, addFeedback, triggerParticle]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerDanger = timeLeft <= 30;
  const timerCritical = timeLeft <= 10;
  const multiplier = getComboMultiplier(combo);

  return (
    <motion.div
      className="relative flex min-h-screen flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <FloatingScore events={floatingScores} />
      <FeedbackText events={feedbacks} />

      <div className="app-shell flex flex-1 flex-col gap-4">
        <div className="panel flex items-center gap-3">
          <div className="flex-1">
            <VibeMeter value={vibeScore} />
          </div>
          <motion.span
            className={`min-w-[52px] text-right text-base font-semibold ${timerDanger ? 'text-destructive' : 'text-foreground'}`}
            animate={timerCritical ? { opacity: [1, 0.7, 1] } : {}}
            transition={timerCritical ? { duration: 0.8, repeat: Infinity } : {}}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <button
            onClick={() => setMuted(!muted)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:text-foreground"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="flex justify-center">
          <span className="status-chip">
            {isReal ? 'Live session' : isAI ? 'AI partner' : 'Simulated partner'}
          </span>
        </div>

        <div className="flex justify-center">
          <ComboCounter combo={combo} multiplier={multiplier} />
        </div>

        <ChallengeDisplay challenge={currentChallenge} timeLeft={challengeTimer} />

        <div className="panel">
          <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">{playerStats.username}</span>
              <CharacterAvatar
                emoji={myChar.emoji}
                color={myChar.color}
                glow={myChar.glow}
                label="You"
                size={96}
                bouncing={myBounce}
              />
              {myRipple && <Ripple color={myRipple} />}
              <ParticleBurst active={particleBurst.active} color={particleBurst.color} id={particleBurst.id} />
            </div>

            <span className="text-sm text-muted-foreground">sync</span>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">{partnerName ?? 'Stranger'}</span>
              <CharacterAvatar
                emoji={partnerChar.emoji}
                color={partnerChar.color}
                glow={partnerChar.glow}
                label="Partner"
                size={96}
                bouncing={partnerBounce}
              />
              {partnerRipple && <Ripple color={partnerRipple} />}
            </div>
          </div>

          {currentChallenge.type === 'sync_pulse' && (
            <div className="mb-4">
              <SyncPulse active onTap={handleSyncTap} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {REACTIONS.map((reaction) => (
              <ReactionButton key={reaction.id} reaction={reaction} onReact={handleReact} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function getMostUsedReaction(sentReactions: ReactionEvent[]): string {
  const counts: Record<string, number> = {};
  sentReactions.forEach((r) => { counts[r.reactionId] = (counts[r.reactionId] ?? 0) + 1; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'hype';
}

export default VibeRoom;
