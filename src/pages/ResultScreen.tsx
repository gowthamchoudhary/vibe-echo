import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';
import { getVibeLabel } from '@/utils/vibeScore';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    vibeScore: number;
    reactionsSent: number;
    reactionsReceived: number;
    mostUsedReaction: string;
    myCharacterId: string;
    partnerCharacterId: string;
  } | null;

  const vibeScore = state?.vibeScore ?? 50;
  const reactionsSent = state?.reactionsSent ?? 0;
  const reactionsReceived = state?.reactionsReceived ?? 0;
  const mostUsedReaction = REACTIONS.find((r) => r.id === (state?.mostUsedReaction ?? 'hype'));
  const myChar = CHARACTERS.find((c) => c.id === (state?.myCharacterId ?? 'robot')) ?? CHARACTERS[0];
  const partnerChar = CHARACTERS.find((c) => c.id === (state?.partnerCharacterId ?? 'witch')) ?? CHARACTERS[3];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <motion.h1
          className="text-4xl font-bold text-foreground text-glow-purple"
          variants={item}
        >
          VIBE UNLOCKED
        </motion.h1>

        <motion.div className="flex items-center gap-6" variants={item}>
          <CharacterAvatar emoji={myChar.emoji} color={myChar.color} glow={myChar.glow} size={80} />
          <span className="text-2xl text-muted-foreground">⚡</span>
          <CharacterAvatar emoji={partnerChar.emoji} color={partnerChar.color} glow={partnerChar.glow} size={80} />
        </motion.div>

        <motion.div className="text-center" variants={item}>
          <motion.p
            className="text-7xl font-bold text-foreground"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
          >
            {vibeScore}%
          </motion.p>
          <p className="mt-2 text-lg font-medium text-primary">{getVibeLabel(vibeScore)}</p>
        </motion.div>

        <motion.div
          className="w-full rounded-lg bg-card p-4"
          style={{ border: '1px solid hsl(var(--border))' }}
          variants={item}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{reactionsSent}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reactionsReceived}</p>
              <p className="text-xs text-muted-foreground">Received</p>
            </div>
            <div>
              <p className="text-2xl">{mostUsedReaction?.emoji ?? '🔥'}</p>
              <p className="text-xs text-muted-foreground">Most Used</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex w-full flex-col gap-3" variants={item}>
          <motion.button
            onClick={() => navigate('/waiting', { state: { characterId: myChar.id } })}
            className="w-full rounded-pill bg-primary py-3 font-semibold text-primary-foreground glow-border-purple"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Vibe Again ✨
          </motion.button>
          <motion.button
            onClick={() => navigate('/select')}
            className="w-full rounded-pill border border-border py-3 font-semibold text-foreground transition-colors hover:bg-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Change Character
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResultScreen;
