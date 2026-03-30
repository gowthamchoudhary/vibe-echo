import { motion, AnimatePresence } from 'framer-motion';

interface FloatingScoreEvent {
  id: number;
  value: number;
  label?: string;
  x: number;
  color: string;
}

interface FloatingScoreProps {
  events: FloatingScoreEvent[];
}

const FloatingScore = ({ events }: FloatingScoreProps) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {events.map((e) => (
          <motion.div
            key={e.id}
            className="absolute text-center font-bold"
            style={{ left: `${e.x}%`, top: '40%', color: e.color }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="text-2xl">+{e.value}</div>
            {e.label && <div className="text-xs">{e.label}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingScore;
