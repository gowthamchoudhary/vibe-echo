import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterAvatar from '@/components/CharacterAvatar';
import ProfileBadge from '@/components/ProfileBadge';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';
import { getVibeLabel } from '@/utils/vibeScore';
import { getVibeTitle } from '@/utils/rewards';
import { getPlayerStats, updatePlayerStats, determinePlayStyle, addToVibeList } from '@/utils/playerIdentity';

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

  useEffect(() => {
    const stats = getPlayerStats();
    const updated = updatePlayerStats({
      totalVibes: stats.totalVibes + 1,
      highestScore: Math.max(stats.highestScore, vibeScore),
      totalReactionsSent: stats.totalReactionsSent + reactionsSent,
      playStyle: determinePlayStyle({ [state?.mostUsedReaction ?? 'hype']: reactionsSent }),
    });
    setPlayerStats(updated);

    setTimeout(() => setTitleRevealed(true), 400);

    if (vibeScore > 75) {
      setTimeout(() => setShowConnectionMoment(true), 700);
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
    show: { transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="app-shell flex flex-col items-center gap-5">
        <motion.h1
          className="text-[28px] font-semibold text-foreground"
          variants={item}
        >
          Session complete
        </motion.h1>

        <motion.div className="panel flex w-full items-center justify-between gap-4" variants={item}>
          <div className="flex flex-col items-center">
            <span className="mb-2 text-[13px] text-muted-foreground">{playerStats.username}</span>
            <CharacterAvatar emoji={myChar.emoji} color={myChar.color} glow={myChar.glow} size={80} />
          </div>
          <span className="text-sm text-muted-foreground">matched</span>
          <div className="flex flex-col items-center">
            <span className="mb-2 text-[13px] text-muted-foreground">{partnerName}</span>
            <CharacterAvatar emoji={partnerChar.emoji} color={partnerChar.color} glow={partnerChar.glow} size={80} />
          </div>
        </motion.div>

        <motion.div className="panel w-full text-center" variants={item}>
          <motion.p
            className="text-[28px] font-semibold text-foreground"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {vibeScore}%
          </motion.p>
          <p className="mt-2 text-base font-medium text-primary">{getVibeLabel(vibeScore)}</p>
        </motion.div>

        <motion.div variants={item} className="panel w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={titleRevealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[13px] uppercase tracking-[0.12em] text-muted-foreground">Title earned</p>
            <p className="mt-2 text-[22px] font-semibold text-foreground">
              {vibeTitle.title}
            </p>
            <p className="text-[13px] text-muted-foreground">{vibeTitle.description}</p>
          </motion.div>
        </motion.div>

        <motion.div className="panel w-full" variants={item}>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-[22px] font-semibold text-foreground">{reactionsSent}</p>
              <p className="text-[13px] text-muted-foreground">Sent</p>
            </div>
            <div>
              <p className="text-[22px] font-semibold text-foreground">{reactionsReceived}</p>
              <p className="text-[13px] text-muted-foreground">Received</p>
            </div>
            <div>
              <p className="text-[22px]">{mostUsedReaction?.emoji ?? '🔥'}</p>
              <p className="text-[13px] text-muted-foreground">Most Used</p>
            </div>
            <div>
              <p className="text-[22px] font-semibold text-foreground">x{maxCombo}</p>
              <p className="text-[13px] text-muted-foreground">Max Combo</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="w-full" variants={item}>
          <ProfileBadge stats={playerStats} />
        </motion.div>

        {showConnectionMoment && vibeScore > 75 && (
          <motion.div
            className="panel w-full text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-primary">Connection moment</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Your vibes were strong. Keep the connection?
            </p>
            <motion.button
              onClick={handleAddToVibeList}
              disabled={addedToVibeList}
              className="primary-btn mt-4 w-full disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {addedToVibeList ? 'Added to Vibe List' : 'Add to Vibe List'}
            </motion.button>
          </motion.div>
        )}

        <motion.div className="flex w-full flex-col gap-3" variants={item}>
          <motion.button
            onClick={() => navigate('/waiting', { state: { characterId: myChar.id } })}
            className="primary-btn w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Vibe Again
          </motion.button>
          <motion.button
            onClick={() => navigate('/select')}
            className="secondary-btn w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Change Character
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResultScreen;
