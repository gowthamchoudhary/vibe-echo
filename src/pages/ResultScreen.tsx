import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import ProfileBadge from '@/components/ProfileBadge';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';
import { getVibeLabel } from '@/utils/vibeScore';
import { getVibeTitle } from '@/utils/rewards';
import { getPlayerStats, updatePlayerStats, determinePlayStyle, addToVibeList, generateUsername } from '@/utils/playerIdentity';

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
    partnerName?: string;
    maxCombo?: number;
  } | null;

  const vibeScore = state?.vibeScore ?? 50;
  const reactionsSent = state?.reactionsSent ?? 0;
  const reactionsReceived = state?.reactionsReceived ?? 0;
  const maxCombo = state?.maxCombo ?? 0;
  const mostUsedReaction = REACTIONS.find((r) => r.id === (state?.mostUsedReaction ?? 'hype'));
  const myChar = CHARACTERS.find((c) => c.id === (state?.myCharacterId ?? 'robot')) ?? CHARACTERS[0];
  const partnerChar = CHARACTERS.find((c) => c.id === (state?.partnerCharacterId ?? 'witch')) ?? CHARACTERS[3];
  const partnerName = state?.partnerName ?? 'Stranger';
  const vibeTitle = getVibeTitle(vibeScore);

  const [playerStats, setPlayerStats] = useState(getPlayerStats());
  const [titleRevealed, setTitleRevealed] = useState(false);
  const [showConnectionMoment, setShowConnectionMoment] = useState(false);
  const [addedToVibeList, setAddedToVibeList] = useState(false);

  // Update stats on mount
  useEffect(() => {
    const stats = getPlayerStats();
    const updated = updatePlayerStats({
      totalVibes: stats.totalVibes + 1,
      highestScore: Math.max(stats.highestScore, vibeScore),
      totalReactionsSent: stats.totalReactionsSent + reactionsSent,
      playStyle: determinePlayStyle({ [state?.mostUsedReaction ?? 'hype']: reactionsSent }),
    });
    setPlayerStats(updated);

    // Title reveal delay
    setTimeout(() => setTitleRevealed(true), 1200);

    // Connection moment for high scores
    if (vibeScore > 75) {
      setTimeout(() => setShowConnectionMoment(true), 2000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToVibeList = () => {
    addToVibeList({
      username: partnerName,
      characterId: state?.partnerCharacterId ?? 'witch',
      vibeScore,
      timestamp: Date.now(),
    });
    setAddedToVibeList(true);
  };

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
          <div className="flex flex-col items-center">
            <span className="mb-1 text-xs text-muted-foreground">{playerStats.username}</span>
            <CharacterAvatar emoji={myChar.emoji} color={myChar.color} glow={myChar.glow} size={80} />
          </div>
          <span className="text-2xl text-muted-foreground">⚡</span>
          <div className="flex flex-col items-center">
            <span className="mb-1 text-xs text-muted-foreground">{partnerName}</span>
            <CharacterAvatar emoji={partnerChar.emoji} color={partnerChar.color} glow={partnerChar.glow} size={80} />
          </div>
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

        {/* Title reveal */}
        <motion.div variants={item} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={titleRevealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Title earned</p>
            <p
              className="mt-1 text-2xl font-bold"
              style={{ color: vibeTitle.color, textShadow: `0 0 20px ${vibeTitle.color}66` }}
            >
              {vibeTitle.title}
            </p>
            <p className="text-sm text-muted-foreground">{vibeTitle.description}</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full rounded-lg bg-card p-4"
          style={{ border: '1px solid hsl(var(--border))' }}
          variants={item}
        >
          <div className="grid grid-cols-4 gap-3 text-center">
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
            <div>
              <p className="text-2xl font-bold text-foreground">x{maxCombo}</p>
              <p className="text-xs text-muted-foreground">Max Combo</p>
            </div>
          </div>
        </motion.div>

        {/* Profile badge */}
        <motion.div className="w-full" variants={item}>
          <ProfileBadge stats={playerStats} />
        </motion.div>

        {/* Connection moment */}
        {showConnectionMoment && vibeScore > 75 && (
          <motion.div
            className="w-full rounded-lg border border-primary/30 bg-primary/10 p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-primary">💞 Connection Moment</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your vibes were so strong — keep the connection?
            </p>
            <motion.button
              onClick={handleAddToVibeList}
              disabled={addedToVibeList}
              className="mt-3 rounded-pill border border-primary/50 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {addedToVibeList ? '✅ Added to Vibe List' : '💫 Add to Vibe List'}
            </motion.button>
          </motion.div>
        )}

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
