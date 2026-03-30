import { motion } from 'framer-motion';
import type { PlayerStats } from '@/utils/playerIdentity';

interface ProfileBadgeProps {
  stats: PlayerStats;
}

const ProfileBadge = ({ stats }: ProfileBadgeProps) => {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        {stats.username.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{stats.username}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{stats.totalVibes} vibes</span>
          <span>·</span>
          <span>Best: {stats.highestScore}%</span>
          <span>·</span>
          <span className="text-primary">{stats.playStyle}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileBadge;
